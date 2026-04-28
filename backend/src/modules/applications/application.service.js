const Application = require("./application.model");
const Job = require("../jobs/job.model");
const pool = require("../../config/db");

exports.applyToJob = async (userId, data) => {
  try {
    console.log('[APPLYTOJOB] START', { userId, dataKeys: Object.keys(data), dataValues: data });
    
    if (!userId) throw new Error('User ID is required');
    if (!data.id_offre) throw new Error('Job ID is required');
    
    const job = await Job.findById(data.id_offre);
    console.log('[APPLYTOJOB] Job lookup result:', { jobFound: !!job, jobData: job });
    
    if (!job) throw new Error("Offre non trouvée");
    if (job.statut !== 'OUVERT') throw new Error(`Cette offre n'accepte plus de candidatures (statut: ${job.statut})`);

    // Check if user already has an application for this job (unless rejected)
    const [existingApps] = await pool.query(
      `SELECT id_candidature, statut FROM candidature WHERE id_user = ? AND id_offre = ?`,
      [userId, data.id_offre]
    );
    
    if (existingApps.length > 0) {
      const existingApp = existingApps[0];
      // Allow re-apply only if previously rejected
      if (existingApp.statut !== 'REJECTED') {
        throw new Error('Vous avez déjà postulé à cette offre. Vous pouvez postuler à nouveau seulement après un rejet.');
      }
    }

    console.log('[APPLYTOJOB] About to create application with:', { id_user: userId, ...data });
    const result = await Application.create({ ...data, id_user: userId });
    console.log('[APPLYTOJOB] Application created successfully:', result);
    return result;
  } catch (error) {
    console.error('[APPLYTOJOB] ERROR:', error.message, error.stack);
    throw error;
  }
};

exports.getMyApplications = async (userId) => {
  return await Application.findByUser(userId);
};

exports.getJobApplications = async (jobId, recruiterId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error("Offre non trouvée");
  
  const companyId = await Job.getCompanyIdByUser(recruiterId);
  if (job.id_entreprise !== companyId) throw new Error("Accès non autorisé");

  return await Application.findByJob(jobId);
};

exports.getCompanyApplications = async (recruiterId) => {
  const companyId = await Job.getCompanyIdByUser(recruiterId);
  if (!companyId) throw new Error("Compte recruteur non configuré");

  // Note: CV parsing has been removed. Candidate skills are now manually provided.
  const rows = await Application.findByCompany(companyId);
  return rows;
};

exports.updateApplicationStatus = async (id, recruiterId, data) => {
  const application = await Application.findById(id);
  if (!application) throw new Error("Candidature non trouvée");
  if (application.recruiter_id !== recruiterId) throw new Error("Accès non autorisé");

  return await Application.updateStatus(id, data.statut, data);
};

exports.respondToOffer = async (id, candidateId, decision) => {
  const application = await Application.findById(id);
  if (!application) throw new Error("Candidature non trouvée");
  if (application.id_user !== candidateId) throw new Error("Accès non autorisé");
  if (application.statut?.toUpperCase() !== "ACCEPTED") throw new Error("Aucune offre active pour cette candidature");

  const normalizedInput = decision?.toUpperCase();
  if (!["ACCEPT", "REJECT"].includes(normalizedInput)) {
    throw new Error("Décision invalide");
  }
  const normalizedDecision = normalizedInput === "ACCEPT" ? "ACCEPTED" : "REJECTED";
  if (application.offer_status && application.offer_status !== "PENDING") {
    throw new Error("Cette offre a déjà reçu une réponse");
  }

  return await Application.respondToOffer(id, normalizedDecision);
};