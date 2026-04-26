const applicationService = require("./application.service");
// 🔔 Import notification helper
const notificationHelper = require("../../services/notificationHelper");

exports.apply = async (req, res, next) => {
  try {
    console.log('[APPLY]', {
      jobId: req.params.jobId,
      userId: req.user?.id,
      hasFile: !!req.file,
      bodyKeys: Object.keys(req.body || {}),
      body: req.body
    });

    const data = { ...req.body };
    // Set job ID
    if (req.params.jobId) {
      data.id_offre = req.params.jobId;
    }
    // Set CV filename if provided
    if (req.file) {
      data.cv = req.file.filename;
    }
    
    console.log('[APPLY] Data to send:', data);
    
    const applicationId = await applicationService.applyToJob(req.user.id, data);
    
    // 🔔 Notification: Notify company about new application
    try {
      const jobDetails = await notificationHelper.getJobDetails(data.id_offre);
      const candidateInfo = await notificationHelper.getCandidateInfo(req.user.id);
      const jobInfo = await notificationHelper.getJobInfo(data.id_offre);
      
      if (jobDetails && candidateInfo && jobInfo) {
        await notificationHelper.notifyCompanyNewApplication(
          jobDetails.id_user,
          candidateInfo.nom,
          jobInfo.titre
        );
      }
    } catch (notifError) {
      console.error("⚠️ Notification error (non-blocking):", notifError.message);
      // Don't break the application if notification fails
    }
    
    res.status(201).json({ id: applicationId, message: "Candidature envoyée" });
  } catch (error) {
    console.log('[APPLY] Error:', error.message);
    next(error);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const apps = await applicationService.getMyApplications(req.user.id);
    res.json(apps);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyApplications = async (req, res, next) => {
  try {
    const apps = await applicationService.getCompanyApplications(req.user.id);
    res.json(apps);
  } catch (error) {
    next(error);
  }
};

exports.getJobApplications = async (req, res, next) => {
  try {
    const apps = await applicationService.getJobApplications(req.params.jobId, req.user.id);
    res.json(apps);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const newStatus = req.body?.statut?.toUpperCase();
    
    await applicationService.updateApplicationStatus(applicationId, req.user.id, req.body);
    
    // 🔔 Notification: Notify candidate about application status changes
    if (newStatus === 'ACCEPTED' || newStatus === 'REJECTED') {
      try {
        // Get application details
        const db = require("../../config/db");
        const [appRows] = await db.query(
          `SELECT c.id_user, o.titre as job_title, comp.nom as company_name FROM candidature c
           JOIN offre o ON c.id_offre = o.id_offre
           JOIN company comp ON o.id_entreprise = comp.id_company
           WHERE c.id_candidature = ?`,
          [applicationId]
        );
        
        if (appRows.length > 0) {
          const app = appRows[0];
          
          if (newStatus === 'ACCEPTED') {
            await notificationHelper.notifyCandidateApplicationAccepted(
              app.id_user,
              app.job_title,
              app.company_name
            );
          } else if (newStatus === 'REJECTED') {
            await notificationHelper.notifyCandidateApplicationRejected(
              app.id_user,
              app.job_title,
              app.company_name
            );
          }
        }
      } catch (notifError) {
        console.error("⚠️ Notification error (non-blocking):", notifError.message);
        // Don't break the status update if notification fails
      }
    }
    
    res.json({ message: "Statut mis à jour" });
  } catch (error) {
    next(error);
  }
};

exports.respondToOffer = async (req, res, next) => {
  try {
    await applicationService.respondToOffer(req.params.id, req.user.id, req.body?.decision);
    res.json({ message: "Réponse à l'offre enregistrée" });
  } catch (error) {
    next(error);
  }
};