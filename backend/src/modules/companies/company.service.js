const pool = require("../../config/db");

// ✅ PROFILE - Get company by user ID
exports.getProfile = async (userId) => {
  try {
    console.error(`[COMPANY SERVICE] Fetching profile for user: ${userId}`);
    const [rows] = await pool.execute(
      "SELECT * FROM company WHERE id_user = ?",
      [userId]
    );
    console.error(`[COMPANY SERVICE] Result: ${rows.length > 0 ? "FOUND" : "NOT FOUND"}`);
    return rows[0] || null;
  } catch (error) {
    console.error(`[COMPANY SERVICE ERROR] getProfile: ${error.message}`);
    throw error;
  }
};

// ✅ UPDATE / UPSERT
exports.updateProfile = async (userId, data) => {
  try {
    console.error(`[COMPANY SERVICE] Updating profile for user: ${userId}`);
    console.error(`[COMPANY SERVICE] Received data:`, JSON.stringify(data));

    // Check if company exists for this user
    const [existing] = await pool.execute(
      "SELECT id_company FROM company WHERE id_user = ?",
      [userId]
    );

    // Filter data to only include valid database columns
    // This prevents "Unknown column" errors if the frontend sends extra fields
    const validColumns = [
      'nom', 'description', 'logo', 'email', 'telephone', 
      'secteur', 'pays', 'site_web', 'type'
    ];

    const cleanData = {};
    Object.keys(data).forEach(key => {
      if (validColumns.includes(key)) {
        cleanData[key] = data[key];
      }
    });

    const keys = Object.keys(cleanData);
    if (keys.length === 0) {
      console.error('[COMPANY SERVICE] No valid fields found to update');
      return await this.getProfile(userId);
    }

    if (existing.length > 0) {
      // UPDATE existing record
      console.error(`[COMPANY SERVICE] Performing UPDATE for company ID: ${existing[0].id_company}`);
      const fields = keys.map(key => `${key} = ?`).join(", ");
      const values = Object.values(cleanData);
      values.push(userId);
      
      const [updateResult] = await pool.execute(
        `UPDATE company SET ${fields} WHERE id_user = ?`,
        values
      );
      console.error(`[COMPANY SERVICE] Update affected rows: ${updateResult.affectedRows}`);
    } else {
      // INSERT new record
      console.error('[COMPANY SERVICE] Performing INSERT...');
      const placeholders = keys.map(() => "?").join(", ");
      const fields = keys.join(", ");
      const values = Object.values(cleanData);
      
      const [insertResult] = await pool.execute(
        `INSERT INTO company (${fields}, id_user) VALUES (${placeholders}, ?)`,
        [...values, userId]
      );
      console.error(`[COMPANY SERVICE] Insert result ID: ${insertResult.insertId}`);
    }

    // Return the fresh profile
    return await this.getProfile(userId);

  } catch (error) {
    console.error(`[COMPANY SERVICE ERROR] updateProfile: ${error.message}`);
    throw error;
  }
};

// ✅ DASHBOARD
exports.getDashboard = async (userId) => {
  try {
    const company = await this.getProfile(userId);
    if (!company) {
      return {
        stats: { totalJobs: 0, totalApplications: 0, interviews: 0, offers: 0 },
        jobs: [],
        applications: [],
        message: "Company not found"
      };
    }

    const [jobRows] = await pool.execute(
      "SELECT * FROM offre WHERE id_entreprise = ?",
      [company.id_company]
    );

    const jobIds = jobRows.map(j => j.id_offre);
    if (jobIds.length === 0) {
      return {
        stats: { totalJobs: 0, totalApplications: 0, interviews: 0, offers: 0 },
        jobs: [],
        applications: []
      };
    }

    const placeholders = jobIds.map(() => "?").join(",");
    const [appRows] = await pool.execute(
      `SELECT c.*, u.nom as nom_candidat FROM candidature c JOIN user u ON c.id_user = u.id_user WHERE c.id_offre IN (${placeholders})`,
      jobIds
    );

    return {
      stats: {
        totalJobs: jobRows.length,
        totalApplications: appRows.length,
        interviews: appRows.filter(a => a.statut === "Entretien planifié").length,
        offers: appRows.filter(a => a.statut === "Acceptée").length,
      },
      jobs: jobRows,
      applications: appRows,
    };
  } catch (error) {
    console.error(`[COMPANY SERVICE ERROR] getDashboard: ${error.message}`);
    throw error;
  }
};

// ✅ STATS
exports.getStats = async (userId) => {
  const dashboard = await this.getDashboard(userId);
  return dashboard.stats;
};

// ✅ HR DASHBOARD
exports.getHrDashboard = async () => {
  try {
    const [activeJobs] = await pool.execute("SELECT COUNT(*) as count FROM offre WHERE statut = 'Active'");
    const [totalApplicants] = await pool.execute("SELECT COUNT(*) as count FROM user WHERE role = 'CANDIDAT'");
    const [interviewsThisMonth] = await pool.execute("SELECT COUNT(*) as count FROM candidature WHERE entretien_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)");
    const [avgMatchingRate] = await pool.execute("SELECT AVG(score) as avg FROM matching");

    return {
      kpis: {
        activeJobs: activeJobs[0].count,
        totalApplicants: totalApplicants[0].count,
        interviewsScheduled: interviewsThisMonth[0].count,
        avgMatchingRate: Math.round(avgMatchingRate[0].avg || 0)
      }
    };
  } catch (error) {
    console.error(`[COMPANY SERVICE ERROR] getHrDashboard: ${error.message}`);
    throw error;
  }
};

// ✅ ANALYTICS
exports.getAnalytics = async () => {
  try {
    // Basic implementation for now
    const [totalCandidates] = await pool.execute("SELECT COUNT(*) as count FROM user WHERE role = 'CANDIDAT'");
    const [activeOffers] = await pool.execute("SELECT COUNT(*) as count FROM offre WHERE statut = 'Active'");
    
    return {
      kpis: {
        totalCandidates: totalCandidates[0].count,
        activeOffers: activeOffers[0].count
      }
    };
  } catch (error) {
    console.error(`[COMPANY SERVICE ERROR] getAnalytics: ${error.message}`);
    throw error;
  }
};