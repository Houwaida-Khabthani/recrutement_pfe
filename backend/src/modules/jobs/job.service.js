const Job = require("./job.model");

exports.getAllJobs = async (filters) => {
  return await Job.findAll(filters);
};

exports.getJobDetails = async (id) => {
  const job = await Job.findById(id);
  if (!job) throw new Error("Offre non trouvée");
  return job;
};

exports.createJob = async (userId, jobData) => {
  const companyId = await Job.getCompanyIdByUser(userId);
  if (!companyId) throw new Error("Compte recruteur non configuré");
  
  return await Job.create({ ...jobData, id_entreprise: companyId });
};

exports.updateJob = async (id, userId, jobData) => {
  console.log('[Service] ============ UPDATE JOB ============');
  console.log('[Service] Job ID:', id);
  console.log('[Service] User ID:', userId);
  console.log('[Service] Job Data:', jobData);
  
  const job = await Job.findById(id);
  if (!job) {
    const error = new Error("Offre non trouvée");
    error.statusCode = 404;
    throw error;
  }
  
  console.log('[Service] Found job - Company ID:', job.id_entreprise);
  
  const companyId = await Job.getCompanyIdByUser(userId);
  console.log('[Service] Retrieved company ID for user:', companyId);
  
  if (!companyId) {
    console.log('[Service] ❌ User has no associated company!');
    const error = new Error("Compte recruteur non configuré");
    error.statusCode = 400;
    throw error;
  }
  
  if (job.id_entreprise !== companyId) {
    const error = new Error(`Accès non autorisé - Cette offre appartient à l'entreprise ${job.id_entreprise}, vous êtes associé à l'entreprise ${companyId}`);
    error.statusCode = 403;
    throw error;
  }

  try {
    const result = await Job.update(id, jobData);
    if (!result) {
      const error = new Error("La mise à jour n'a pas affecté le job");
      error.statusCode = 400;
      throw error;
    }
    return result;
  } catch (error) {
    console.error('[Service] Error updating job:', error.message);
    throw error;
  }
};

exports.deleteJob = async (id, userId) => {
  const job = await Job.findById(id);
  if (!job) throw new Error("Offre non trouvée");
  
  const companyId = await Job.getCompanyIdByUser(userId);
  if (job.id_entreprise !== companyId) throw new Error("Accès non autorisé");

  return await Job.delete(id);
};

exports.getMyJobs = async (userId) => {
  // Return empty array if no userId
  if (!userId) {
    console.log('[SERVICE] No userId provided to getMyJobs');
    return [];
  }
  try {
    console.log('[SERVICE] Getting jobs for user:', userId);
    const jobs = await Job.findByRecruiter(userId);
    console.log('[SERVICE] Returned ' + jobs.length + ' jobs');
    return jobs;
  } catch (error) {
    // Log error but return empty array instead of failing
    console.error('[SERVICE] Error fetching recruiter jobs:', error.message);
    return [];
  }
};