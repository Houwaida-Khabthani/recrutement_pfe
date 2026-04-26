const pool = require("../../config/db");

const Interview = {
  getCandidateInterviews: async (userId) => {
    const [rows] = await pool.query(
      `SELECT
         i.id_interview AS id,
         i.step,
         i.date,
         i.location,
         i.meeting_link AS meetingLink,
         i.status,
         i.notes,
         i.confirmed_at,
         i.confirmed_by,
         c.id_candidature AS application_id,
         c.expected_interviews,
         o.titre AS jobTitle,
         co.nom AS company
       FROM interviews i
       JOIN candidature c ON i.id_candidature = c.id_candidature
       JOIN offre o ON c.id_offre = o.id_offre
       JOIN company co ON o.id_entreprise = co.id_company
       WHERE c.id_user = ?
       ORDER BY i.step ASC, i.date DESC`,
      [userId]
    );
    return rows;
  },

  getApplicationInterviews: async (applicationId) => {
    const [rows] = await pool.query(
      `SELECT
         i.id_interview AS id,
         i.step,
         i.date,
         i.location,
         i.meeting_link AS meetingLink,
         i.status,
         i.notes,
         i.confirmed_at,
         i.confirmed_by,
         c.id_candidature AS application_id,
         c.expected_interviews,
         o.titre AS jobTitle,
         co.nom AS company
       FROM interviews i
       JOIN candidature c ON i.id_candidature = c.id_candidature
       JOIN offre o ON c.id_offre = o.id_offre
       JOIN company co ON o.id_entreprise = co.id_company
       WHERE c.id_candidature = ?
       ORDER BY i.step ASC, i.date ASC`,
      [applicationId]
    );
    return rows;
  },

  getInterviewById: async (id) => {
    const [rows] = await pool.query(
      `SELECT i.*, c.id_user AS candidate_id, c.id_offre, o.id_entreprise AS company_id, c.expected_interviews
       FROM interviews i
       JOIN candidature c ON i.id_candidature = c.id_candidature
       JOIN offre o ON c.id_offre = o.id_offre
       WHERE i.id_interview = ?`,
      [id]
    );
    return rows[0];
  },

  getApplicationSummary: async (applicationId) => {
    const [rows] = await pool.query(
      `SELECT c.id_candidature,
              COALESCE(c.expected_interviews, 1) AS expected_interviews,
              COALESCE(MAX(i.step), 0) AS scheduled_steps,
              COALESCE(SUM(i.status = 'passed'), 0) AS passed_steps,
              COALESCE(SUM(i.status = 'scheduled'), 0) AS scheduled_count
       FROM candidature c
       LEFT JOIN interviews i ON i.id_candidature = c.id_candidature
       WHERE c.id_candidature = ?
       GROUP BY c.id_candidature`,
      [applicationId]
    );
    return rows[0];
  },

  setExpectedInterviews: async (applicationId, expectedInterviews) => {
    const [result] = await pool.query(
      `UPDATE candidature SET expected_interviews = ? WHERE id_candidature = ?`,
      [expectedInterviews, applicationId]
    );
    return result.affectedRows > 0;
  },

  scheduleInterviewStep: async (applicationId, step, date, meetingLink = null) => {
    // Use provided meeting link or generate a placeholder
    const meetingLinkValue = meetingLink || `https://meet.google.com/ess-placeholder-${applicationId}-${step}`;

    const [existing] = await pool.query(
      `SELECT id_interview FROM interviews WHERE id_candidature = ? AND step = ?`,
      [applicationId, step]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE interviews SET date = ?, location = ?, meeting_link = ?, status = 'scheduled' WHERE id_interview = ?`,
        [date, meetingLinkValue, meetingLinkValue, existing[0].id_interview]
      );
      return existing[0].id_interview;
    }

    const [result] = await pool.query(
      `INSERT INTO interviews (id_candidature, step, date, location, meeting_link, status)
       VALUES (?, ?, ?, ?, ?, 'scheduled')`,
      [applicationId, step, date, meetingLinkValue, meetingLinkValue]
    );

    return result.insertId;
  },

  updateInterviewStatus: async (interviewId, status, notes = null) => {
    const [result] = await pool.query(
      `UPDATE interviews SET status = ?, notes = ?, updated_at = NOW() WHERE id_interview = ?`,
      [status, notes, interviewId]
    );
    return result.affectedRows > 0;
  },

  updateMeetingLink: async (interviewId, meetingLink) => {
    const [result] = await pool.query(
      `UPDATE interviews SET meeting_link = ?, updated_at = NOW() WHERE id_interview = ?`,
      [meetingLink, interviewId]
    );
    if (result.affectedRows === 0) {
      throw new Error("Interview not found");
    }
    return await Interview.getInterviewById(interviewId);
  },

  updateConfirmation: async (interviewId, userId) => {
    const [result] = await pool.query(
      `UPDATE interviews SET status = 'confirmed', confirmed_at = NOW(), confirmed_by = ?, updated_at = NOW() WHERE id_interview = ?`,
      [userId, interviewId]
    );
    if (result.affectedRows === 0) {
      throw new Error("Interview not found");
    }
    return await Interview.getInterviewById(interviewId);
  }
};

module.exports = Interview;
