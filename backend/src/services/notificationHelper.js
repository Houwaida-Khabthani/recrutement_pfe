// 🔔 Notification Helper - Centralized notification logic
const pool = require("../config/db");
const notificationService = require("../modules/notifications/notification.service");

/**
 * Get all admin user IDs
 */
exports.getAllAdminIds = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT id_user FROM user WHERE role = 'ADMIN'"
    );
    return rows.map(r => r.id_user);
  } catch (error) {
    console.error('❌ Error fetching admin IDs:', error.message);
    return [];
  }
};

/**
 * Get company info by company ID
 */
exports.getCompanyInfo = async (companyId) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_company, nom, id_user FROM company WHERE id_company = ?",
      [companyId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching company info:', error.message);
    return null;
  }
};

/**
 * Get job info by job ID
 */
exports.getJobInfo = async (jobId) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_offre, titre, id_entreprise FROM offre WHERE id_offre = ?",
      [jobId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching job info:', error.message);
    return null;
  }
};

/**
 * Get candidate info by user ID
 */
exports.getCandidateInfo = async (userId) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_user, nom FROM user WHERE id_user = ?",
      [userId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching candidate info:', error.message);
    return null;
  }
};

/**
 * Get job details (with company info)
 */
exports.getJobDetails = async (jobId) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id_offre, o.titre, o.id_entreprise, c.id_user FROM offre o
       JOIN company c ON o.id_entreprise = c.id_company
       WHERE o.id_offre = ?`,
      [jobId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching job details:', error.message);
    return null;
  }
};

/**
 * Notify all admins about new company
 */
exports.notifyAdminsNewCompany = async (companyName) => {
  try {
    const adminIds = await exports.getAllAdminIds();
    
    for (const adminId of adminIds) {
      await notificationService.createNotification({
        id_user: adminId,
        message: `Une nouvelle entreprise (${companyName}) attend validation`,
        type: "info"
      });
    }
    console.log(`✅ Notified ${adminIds.length} admins about new company: ${companyName}`);
  } catch (error) {
    console.error('❌ Error notifying admins:', error.message);
  }
};

/**
 * Notify company about account approval
 */
exports.notifyCompanyApproved = async (companyUserId, companyName) => {
  try {
    await notificationService.createNotification({
      id_user: companyUserId,
      message: `Félicitations! Votre entreprise (${companyName}) a été approuvée. Vous pouvez maintenant publier des offres d'emploi.`,
      type: "success"
    });
    console.log(`✅ Notified company user ${companyUserId} about approval`);
  } catch (error) {
    console.error('❌ Error notifying company:', error.message);
  }
};

/**
 * Notify company about candidate application
 */
exports.notifyCompanyNewApplication = async (companyUserId, candidateName, jobTitle) => {
  try {
    await notificationService.createNotification({
      id_user: companyUserId,
      message: `${candidateName} a postuler pour le poste: ${jobTitle}`,
      type: "info"
    });
    console.log(`✅ Notified company user ${companyUserId} about new application`);
  } catch (error) {
    console.error('❌ Error notifying company about application:', error.message);
  }
};

/**
 * Notify candidate about application accepted
 */
exports.notifyCandidateApplicationAccepted = async (candidateUserId, jobTitle, companyName) => {
  try {
    await notificationService.createNotification({
      id_user: candidateUserId,
      message: `Bonne nouvelle! ${companyName} a accepté votre candidature pour: ${jobTitle}`,
      type: "success"
    });
    console.log(`✅ Notified candidate ${candidateUserId} about acceptance`);
  } catch (error) {
    console.error('❌ Error notifying candidate:', error.message);
  }
};

/**
 * Notify candidate about application rejected
 */
exports.notifyCandidateApplicationRejected = async (candidateUserId, jobTitle, companyName) => {
  try {
    await notificationService.createNotification({
      id_user: candidateUserId,
      message: `Nous regrettons d'informer ${companyName} a rejeté votre candidature pour: ${jobTitle}`,
      type: "error"
    });
    console.log(`✅ Notified candidate ${candidateUserId} about rejection`);
  } catch (error) {
    console.error('❌ Error notifying candidate:', error.message);
  }
};
