const db = require("../../config/db");

/**
 * GET RECRUITER PROFILE
 * Returns recruiter user data and associated company data
 */
exports.getRecruiterProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Get user/recruiter data
    const [users] = await db.execute(
      'SELECT id_user, nom, email, role, telephone, avatar, nom_entreprise, secteur as user_secteur, site_web as user_site_web, description_entreprise FROM user WHERE id_user = ?', 
      [userId]
    );
    const recruiter = users[0];

    if (!recruiter) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. Get associated company data
    const [companies] = await db.execute(
      'SELECT id_company, nom, description, logo, secteur, email, telephone, site_web, pays, type FROM company WHERE id_user = ?',
      [userId]
    );
    
    let company = companies[0] || null;
    let isFallback = false;

    // 3. Handle fallback if company record doesn't exist
    if (!company && recruiter.nom_entreprise) {
      isFallback = true;
      company = {
        id_company: null,
        nom: recruiter.nom_entreprise,
        description: recruiter.description_entreprise,
        secteur: recruiter.user_secteur,
        email: recruiter.email, 
        telephone: recruiter.telephone,
        site_web: recruiter.user_site_web,
        pays: 'N/A',
        type: 'Organization'
      };
    }

    // 4. Calculate Stats (Active Jobs, Views, Apps, Drafts, Interviews)
    let stats = { 
      activeJobs: 0, 
      totalApplications: 0, 
      totalViews: 0,
      draftJobs: 0,
      interviewsScheduled: 0 
    };
    const targetCompanyId = company?.id_company || null;

    if (targetCompanyId) {
      // Active Jobs (OUVERT or Active)
      const [activeJobsResult] = await db.execute(
        'SELECT COUNT(*) as count FROM offre WHERE id_entreprise = ? AND (statut = "OUVERT" OR statut = "Active")',
        [targetCompanyId]
      );
      stats.activeJobs = activeJobsResult[0]?.count || 0;

      // Closed/Draft Jobs (FERME)
      const [draftJobsResult] = await db.execute(
        'SELECT COUNT(*) as count FROM offre WHERE id_entreprise = ? AND statut = "FERME"',
        [targetCompanyId]
      );
      stats.draftJobs = draftJobsResult[0]?.count || 0;

      // Total Views
      const [totalViewsResult] = await db.execute(
        'SELECT SUM(nombre_vues) as total FROM offre WHERE id_entreprise = ?',
        [targetCompanyId]
      );
      stats.totalViews = totalViewsResult[0]?.total || 0;

      // Total Applications
      const [totalAppsResult] = await db.execute(
        'SELECT COUNT(*) as count FROM candidature c JOIN offre o ON c.id_offre = o.id_offre WHERE o.id_entreprise = ?',
        [targetCompanyId]
      );
      stats.totalApplications = totalAppsResult[0]?.count || 0;

      // Interviews Scheduled
      const [interviewsResult] = await db.execute(
        'SELECT COUNT(*) as count FROM candidature c JOIN offre o ON c.id_offre = o.id_offre WHERE o.id_entreprise = ? AND c.statut IN ("INTERVIEW", "ENTRETIEN")',
        [targetCompanyId]
      );
      stats.interviewsScheduled = interviewsResult[0]?.count || 0;
    }

    // 5. Final Response
    res.json({
      success: true,
      data: {
        recruiter: {
          id: recruiter.id_user,
          nom: recruiter.nom,
          email: recruiter.email,
          role: recruiter.role,
          telephone: recruiter.telephone,
          avatar: recruiter.avatar,
          nom_entreprise: recruiter.nom_entreprise
        },
        company: company ? { ...company, is_fallback: isFallback } : null,
        stats: stats
      }
    });

  } catch (error) {
    console.error(`[RECRUITER PROFILE ERROR] ${error.message}`);
    next(error);
  }
};
