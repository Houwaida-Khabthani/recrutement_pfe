const jobService = require("./job.service");

exports.getAllJobs = async (req, res, next) => {
  try {
    const filters = req.query;
    const jobs = await jobService.getAllJobs(filters);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

exports.getJobDetails = async (req, res, next) => {
  try {
    const job = await jobService.getJobDetails(req.params.id);
    res.json(job);
  } catch (error) {
    next(error);
  }
};

exports.createJob = async (req, res, next) => {
  try {
    const jobId = await jobService.createJob(req.user.id, req.body);
    res.status(201).json({ id: jobId, message: "Offre créée avec succès" });
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    await jobService.updateJob(req.params.id, req.user.id, req.body);
    res.json({ message: "Offre mise à jour" });
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(req.params.id, req.user.id);
    res.json({ message: "Offre supprimée" });
  } catch (error) {
    next(error);
  }
};

exports.getMyJobs = async (req, res, next) => {
  try {
    console.log('[JOBS] getMyJobs called');
    console.log('[JOBS] req.user:', req.user);
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log('[JOBS] ❌ No user in request');
      return res.status(401).json({ message: "Not authenticated. Please login first." });
    }
    
    console.log('[JOBS] ✅ User authenticated:', req.user.id);
    const jobs = await jobService.getMyJobs(req.user.id);
    console.log('[JOBS] Found ' + jobs.length + ' jobs');
    res.json(jobs);
  } catch (error) {
    console.error('[JOBS] ❌ getMyJobs error:', error.message);
    console.error('[JOBS] Stack:', error.stack);
    next(error);
  }
};
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getAllJobs(); // or any logic
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};
