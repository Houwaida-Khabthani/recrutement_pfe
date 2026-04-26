const interviewService = require("./interview.service");
const { checkIfUserCanJoin, validateMeetingLink } = require("./interview.utils");

/**
 * GET /api/interviews
 */
exports.getMyInterviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const interviews = await interviewService.getMyInterviews(userId);

    res.json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching interviews" });
  }
};

/**
 * GET /api/interviews/:id/can-join
 * Check if user can join a specific interview
 */
exports.canJoin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get interview details
    const interview = await interviewService.getInterviewById(id);
    
    if (!interview) {
      return res.status(404).json({ 
        success: false, 
        canJoin: false,
        message: "Interview not found" 
      });
    }

    // Verify user has access to this interview (candidate or recruiter)
    const hasAccess = await interviewService.verifyUserAccess(userId, interview);
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        canJoin: false,
        message: "Access denied" 
      });
    }

    // Check if user can join
    const joinInfo = checkIfUserCanJoin(interview);

    // Validate meeting link if it exists
    let meetingLinkValid = null;
    if (interview.meeting_link) {
      meetingLinkValid = validateMeetingLink(interview.meeting_link);
    }

    res.json({
      success: true,
      canJoin: joinInfo.canJoin,
      reason: joinInfo.reason,
      timeInfo: joinInfo.timeInfo,
      meetingLink: interview.meeting_link,
      meetingLinkValid: meetingLinkValid,
      status: interview.status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking interview join eligibility" });
  }
};

/**
 * GET /api/interviews/application/:applicationId
 */
exports.getApplicationInterviews = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const interviews = await interviewService.getApplicationInterviews(applicationId);
    res.json({ success: true, data: interviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching interview timeline" });
  }
};

/**
 * PATCH /api/interviews/application/:applicationId/expected
 */
exports.setExpectedInterviews = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { expected_interviews } = req.body;

    if (!expected_interviews || expected_interviews < 1 || expected_interviews > 5) {
      return res.status(400).json({ message: "Expected interviews must be between 1 and 5" });
    }

    await interviewService.setExpectedInterviews(applicationId, expected_interviews);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Error setting expected interviews" });
  }
};

/**
 * POST /api/interviews/application/:applicationId
 */
exports.scheduleInterviewStep = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { step, date, meeting_link } = req.body;
    const recruiterId = req.user.id;

    if (!step || !date) {
      return res.status(400).json({ message: "Step and date are required" });
    }

    const interview = await interviewService.scheduleInterviewStep(applicationId, recruiterId, Number(step), date, meeting_link);
    res.json({ success: true, data: interview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Error scheduling interview" });
  }
};

/**
 * PATCH /api/interviews/:id/status
 */
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Normalize incoming status
    const normalizedStatus = status?.toLowerCase();

    // Validate status - include "confirmed"
    if (!["scheduled","confirmed","passed","failed","cancelled"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid interview status" });
    }

    const interview = await interviewService.updateInterviewStatus(id, normalizedStatus, notes);
    res.json({ success: true, data: interview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Error updating interview status" });
  }
};

/**
 * PATCH /api/interviews/:id/meeting-link
 * Update meeting link for an interview (recruiter only)
 */
exports.updateMeetingLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { meeting_link } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only recruiters and admins can update meeting link
    if (userRole !== 'recruiter' && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Only recruiters can update meeting links" 
      });
    }

    // Validate meeting_link if provided
    if (meeting_link) {
      const validation = validateMeetingLink(meeting_link);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: validation.error || "Invalid meeting link" 
        });
      }
    }

    // Get interview to verify it exists
    const interview = await interviewService.getInterviewById(id);
    if (!interview) {
      return res.status(404).json({ 
        success: false, 
        message: "Interview not found" 
      });
    }

    // Update the meeting link
    const updatedInterview = await interviewService.updateMeetingLink(id, meeting_link);

    // Emit socket event for real-time update
    const socketService = require('../../services/socket.service');
    const io = socketService.getIo();
    
    if (io) {
      // Get the application/candidature to find the candidate
      const application = await interviewService.getApplicationByInterviewId(id);
      if (application && application.id_candidat) {
        // Emit to the candidate
        io.to(`user_${application.id_candidat}`).emit('meeting_link_added', {
          interviewId: parseInt(id),
          meetingLink: meeting_link,
          jobTitle: application.jobTitle,
          company: application.company
        });
        console.log(`[Socket] Emitted meeting_link_added to candidate ${application.id_candidat}`);
      }
    }

    res.json({
      success: true,
      message: "Meeting link updated successfully",
      data: {
        id_interview: updatedInterview.id_interview,
        meeting_link: updatedInterview.meeting_link
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Error updating meeting link" });
  }
};

/**
 * PATCH /api/interviews/:id/confirm
 */
exports.confirm = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const interview = await interviewService.confirmInterview(id, userId);

    res.json({ success: true, data: interview });
  } catch (error) {
    console.error(error);
    const statusCode = error.message.includes('déjà confirmé') || 
                       error.message.includes('annulé') || 
                       error.message.includes('terminé') ? 400 : 500;
    res.status(statusCode).json({ message: error.message || "Error confirming interview" });
  }
};

/**
 * PATCH /api/interviews/:id/cancel
 */
exports.cancel = async (req, res) => {
  try {
    const { id } = req.params;

    await interviewService.cancelInterview(id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling interview" });
  }
};
