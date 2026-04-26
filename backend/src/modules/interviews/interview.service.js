const interviewModel = require("./interview.model");
const Application = require("../applications/application.model");
const pool = require("../../config/db");

exports.getMyInterviews = async (userId) => {
  return await interviewModel.getCandidateInterviews(userId);
};

exports.getInterviewById = async (interviewId) => {
  return await interviewModel.getInterviewById(interviewId);
};

exports.verifyUserAccess = async (userId, interview) => {
  // Check if user is the candidate
  if (interview.candidate_id === userId) {
    return true;
  }
  
  // Check if user is the recruiter who owns the application
  const [application] = await pool.query(
    `SELECT recruiter_id FROM candidature WHERE id_candidature = ?`,
    [interview.id_candidature]
  );
  
  if (application.length > 0 && application[0].recruiter_id === userId) {
    return true;
  }
  
  // Check if user is admin
  const [user] = await pool.query(
    `SELECT role FROM users WHERE id_user = ?`,
    [userId]
  );
  
  if (user.length > 0 && user[0].role === 'admin') {
    return true;
  }
  
  return false;
};

exports.getApplicationInterviews = async (applicationId) => {
  const application = await Application.findById(applicationId);
  if (!application) throw new Error("Candidature non trouvée");

  return await interviewModel.getApplicationInterviews(applicationId);
};

exports.setExpectedInterviews = async (applicationId, expectedInterviews) => {
  const application = await Application.findById(applicationId);
  if (!application) throw new Error("Candidature non trouvée");

  const count = Math.min(Math.max(parseInt(expectedInterviews, 10) || 1, 1), 5);
  return await interviewModel.setExpectedInterviews(applicationId, count);
};

exports.scheduleInterviewStep = async (applicationId, recruiterId, step, date, meetingLink = null) => {
  const application = await Application.findById(applicationId);

  if (!application) throw new Error("Candidature non trouvée");
  if (application.recruiter_id !== recruiterId) throw new Error("Accès non autorisé");

  // Use meeting link from application (entretien_lieu) if not provided
  const finalMeetingLink = meetingLink || application.entretien_lieu || null;

  const expectedInterviews = application.expected_interviews || 1;
  const safeStep = Math.min(Math.max(parseInt(step, 10) || 0, 1), expectedInterviews);

  if (safeStep !== Number(step)) {
    throw new Error("Numéro d'entretien invalide");
  }

  if (safeStep > expectedInterviews) {
    throw new Error(`Le nombre maximal d'entretiens est ${expectedInterviews}`);
  }

  // Validation: Cannot schedule step N before step N-1 is passed
  if (safeStep > 1) {
    const [prevRows] = await require("../../config/db").query(
      `SELECT status FROM interviews WHERE id_candidature = ? AND step = ?`,
      [applicationId, safeStep - 1]
    );

    if (!prevRows.length) {
      throw new Error(`Le précédent entretien (${safeStep - 1}) doit être planifié avant de planifier le suivant.`);
    }

    const prevStatus = prevRows[0].status;
    if (prevStatus !== 'passed') {
      throw new Error(`L'entretien ${safeStep - 1} doit être passé avant de planifier l'entretien ${safeStep}.`);
    }
  }

  return await interviewModel.scheduleInterviewStep(applicationId, safeStep, date, finalMeetingLink);
};

exports.updateInterviewStatus = async (interviewId, status, notes) => {
  const interview = await interviewModel.getInterviewById(interviewId);
  if (!interview) throw new Error("Entretien non trouvé");

  // Debug logs
  console.log("Current status:", interview.status);
  console.log("Next status:", status);

  // Define allowed status transitions
  const allowedTransitions = {
    scheduled: ["confirmed", "cancelled"],
    confirmed: ["passed", "failed", "cancelled"]
  };

  // Validate status transition
  const currentStatus = interview.status?.toLowerCase();
  const normalizedStatus = status?.toLowerCase();

  if (!allowedTransitions[currentStatus]?.includes(normalizedStatus)) {
    throw new Error("invalid interview statut");
  }

  // Update the interview status
  await interviewModel.updateInterviewStatus(interviewId, normalizedStatus, notes);

  const applicationId = interview.id_candidature;

  if (normalizedStatus === 'failed') {
    // Auto-reject the candidate and cancel all future interviews
    await Application.updateStatus(applicationId, 'REJECTED', { note_recruteur: `Rejected after failing interview ${interview.step}` });

    // Cancel all future interviews
    await pool.query(
      `UPDATE interviews SET status = 'cancelled', notes = 'Cancelled due to previous interview failure' WHERE id_candidature = ? AND step > ? AND status IN ('scheduled', 'confirmed')`,
      [applicationId, interview.step]
    );

  } else if (normalizedStatus === 'passed') {
    // Check if all expected interviews are now passed
    const summary = await interviewModel.getApplicationSummary(applicationId);
    const expectedInterviews = summary.expected_interviews || 1;
    const passedInterviews = summary.passed_steps + 1; // +1 because we just passed this one

    if (passedInterviews >= expectedInterviews) {
      // All interviews passed - accept the candidate
      await Application.updateStatus(applicationId, 'ACCEPTED', { note_recruteur: `Accepted after passing all ${expectedInterviews} interviews` });
    }
  }

  // Return the updated interview
  return await interviewModel.getInterviewById(interviewId);
};

exports.confirmInterview = async (interviewId, userId) => {
  const interview = await interviewModel.getInterviewById(interviewId);
  if (!interview) throw new Error("Entretien non trouvé");

  const currentStatus = interview.status?.toLowerCase();

  // Validation: reject if cancelled
  if (currentStatus === 'cancelled') {
    throw new Error("Impossible de confirmer un entretien annulé");
  }

  // Validation: reject if already confirmed
  if (currentStatus === 'confirmed') {
    throw new Error("Entretien déjà confirmé");
  }

  // Validation: reject if passed/failed
  if (currentStatus === 'passed' || currentStatus === 'failed') {
    throw new Error("Impossible de confirmer un entretien terminé");
  }

  // Update with confirmation timestamp
  return await interviewModel.updateConfirmation(interviewId, userId);
};

exports.cancelInterview = async (interviewId) => {
  const interview = await interviewModel.getInterviewById(interviewId);
  if (!interview) throw new Error("Entretien non trouvé");

  return await interviewModel.updateInterviewStatus(interviewId, 'cancelled');
};

exports.updateMeetingLink = async (interviewId, meetingLink) => {
  const interview = await interviewModel.getInterviewById(interviewId);
  if (!interview) throw new Error("Entretien non trouvé");

  return await interviewModel.updateMeetingLink(interviewId, meetingLink);
};

exports.getApplicationByInterviewId = async (interviewId) => {
  const interview = await interviewModel.getInterviewById(interviewId);
  if (!interview || !interview.id_candidature) return null;

  const application = await Application.findById(interview.id_candidature);
  return application;
};
