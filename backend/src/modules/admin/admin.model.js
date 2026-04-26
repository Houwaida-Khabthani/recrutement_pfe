const pool = require("../../config/db");
const bcrypt = require("bcrypt");

const Admin = {
  // User CRUD
  getAllUsers: async (filters = {}) => {
    let query = "SELECT id_user, nom, email, role, telephone, pays, date_inscription, is_verified FROM user WHERE 1=1";
    const params = [];

    if (filters.search) {
      query += " AND (nom LIKE ? OR email LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.role) {
      query += " AND role = ?";
      params.push(filters.role);
    }

    query += " ORDER BY date_inscription DESC";
    const [rows] = await pool.query(query, params);
    return rows;
  },

  createUser: async (data) => {
    const { nom, email, mot_de_passe, role, telephone, pays, adresse, civilite } = data;

    // ✅ Validate required fields
    if (!nom || !email || !mot_de_passe || !role) {
      throw new Error("Nom, email, mot de passe et rôle sont obligatoires");
    }

    // ✅ Validate password strength
    if (mot_de_passe.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }

    // ✅ Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const [result] = await pool.query(
      "INSERT INTO user (nom, email, mot_de_passe, role, telephone, pays, adresse, civilite, is_verified, date_inscription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())",
      [nom, email, hashedPassword, role, telephone, pays, adresse, civilite]
    );
    return result.insertId;
  },

  updateUser: async (id, data) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    values.push(id);
    const [result] = await pool.query(
      `UPDATE user SET ${fields.join(", ")} WHERE id_user = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  verifyUser: async (id, status) => {
    const [result] = await pool.query("UPDATE user SET is_verified = ? WHERE id_user = ?", [status, id]);
    return result.affectedRows > 0;
  },

  deleteUser: async (id) => {
    const [result] = await pool.query("DELETE FROM user WHERE id_user = ?", [id]);
    return result.affectedRows > 0;
  },

  // Company CRUD
  getAllCompanies: async (filters = {}) => {
    let query = "SELECT c.id_company, c.nom, c.description, c.email, c.secteur, c.pays, c.site_web, c.logo, c.status, c.id_user, u.nom as user_name FROM company c LEFT JOIN user u ON c.id_user = u.id_user WHERE 1=1";
    const params = [];

    if (filters.search) {
      query += " AND (c.nom LIKE ? OR c.email LIKE ? OR u.nom LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.status) {
      query += " AND c.status = ?";
      params.push(filters.status);
    }

    query += " ORDER BY c.nom";
    const [rows] = await pool.query(query, params);
    return rows;
  },

  createCompany: async (data) => {
    const { nom, description, email, secteur, id_user } = data;
    const [result] = await pool.query(
      "INSERT INTO company (nom, description, email, secteur, id_user) VALUES (?, ?, ?, ?, ?)",
      [nom, description, email, secteur, id_user]
    );
    return result.insertId;
  },

  updateCompany: async (id, data) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    values.push(id);
    const [result] = await pool.query(
      `UPDATE company SET ${fields.join(", ")} WHERE id_company = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  deleteCompany: async (id) => {
    const [result] = await pool.query("DELETE FROM company WHERE id_company = ?", [id]);
    return result.affectedRows > 0;
  },

  updateCompanyStatus: async (id, status, reason = null) => {
    try {
      console.log(`[ADMIN MODEL] Updating company ${id} status to ${status}`, { reason });
      
      // First, get the company's id_user
      const [company] = await pool.query("SELECT id_user FROM company WHERE id_company = ?", [id]);
      
      if (company.length === 0) {
        console.log(`[ADMIN MODEL] Company not found: ${id}`);
        return false;
      }
      
      const userId = company[0].id_user;
      console.log(`[ADMIN MODEL] Found company user: ${userId}`);
      
      // Update company status
      let query = "UPDATE company SET status = ?";
      const params = [status];
      
      // Optional: store rejection reason in description or a separate field
      if (reason && status === 'rejected') {
        query += ", description = CONCAT(IFNULL(description, ''), '\n[REJECTION REASON: ', ?, ']')";
        params.push(reason);
      }
      
      query += " WHERE id_company = ?";
      params.push(id);
      
      console.log(`[ADMIN MODEL] Updating company with query:`, query);
      
      const [companyResult] = await pool.query(query, params);
      
      console.log(`[ADMIN MODEL] Company update result:`, { affectedRows: companyResult.affectedRows });
      
      // Also update user status to match
      if (userId) {
        const userQuery = "UPDATE user SET status = ? WHERE id_user = ?";
        const userParams = [status, userId];
        
        const [userResult] = await pool.query(userQuery, userParams);
        
        console.log(`[ADMIN MODEL] User update result:`, { affectedRows: userResult.affectedRows });
      }
      
      return companyResult.affectedRows > 0;
    } catch (error) {
      console.error(`[ADMIN MODEL] Database error:`, error.message);
      throw error;
    }
  },

  // Applications CRUD
  getAllApplications: async (filters = {}) => {
    let query = `SELECT c.*, u.nom as candidate_name, u.email, o.titre as job_title, o.salaire
                 FROM candidature c
                 JOIN user u ON c.id_user = u.id_user
                 JOIN offre o ON c.id_offre = o.id_offre
                 WHERE 1=1`;
    const params = [];

    if (filters.search) {
      query += " AND (u.nom LIKE ? OR o.titre LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.status) {
      query += " AND c.statut = ?";
      params.push(filters.status);
    }

    query += " ORDER BY c.date_postule DESC";
    const [rows] = await pool.query(query, params);
    return rows;
  },

  updateApplicationStatus: async (id, status) => {
    const [result] = await pool.query("UPDATE candidature SET statut = ? WHERE id_candidature = ?", [status, id]);
    return result.affectedRows > 0;
  },

  deleteApplication: async (id) => {
    const [result] = await pool.query("DELETE FROM candidature WHERE id_candidature = ?", [id]);
    return result.affectedRows > 0;
  },

  // Stats
  getStats: async () => {
    const [[users]] = await pool.query("SELECT COUNT(*) as total FROM user");
    const [[offers]] = await pool.query("SELECT COUNT(*) as total FROM offre");
    const [[apps]] = await pool.query("SELECT COUNT(*) as total FROM candidature");
    const [[companies]] = await pool.query("SELECT COUNT(*) as total FROM company");
    return {
      totalUsers: users.total,
      totalOffers: offers.total,
      totalApplications: apps.total,
      totalCompanies: companies.total
    };
  },

  getReports: async () => {
    const [recentUsers] = await pool.query("SELECT nom, email, role, date_inscription FROM user ORDER BY date_inscription DESC LIMIT 5");
    const [recentOffers] = await pool.query("SELECT titre, date_pub FROM offre ORDER BY date_pub DESC LIMIT 5");
    const [applicationStats] = await pool.query("SELECT statut, COUNT(*) as count FROM candidature GROUP BY statut");
    return {
      recentUsers,
      recentOffers,
      applicationStats
    };
  },

  // Job CRUD for admin
  getAllJobs: async (filters = {}) => {
    let query = `SELECT o.id_offre, o.titre, o.description, o.localisation, o.statut, o.date_pub, o.type_contrat, o.salaire,
                        c.nom as company_name,
                        u.nom as recruiter_name
                 FROM offre o
                 LEFT JOIN company c ON o.id_entreprise = c.id_company
                 LEFT JOIN user u ON c.id_user = u.id_user
                 WHERE 1=1`;
    const params = [];

    if (filters.search) {
      query += " AND (o.titre LIKE ? OR c.nom LIKE ? OR u.nom LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.status) {
      query += " AND o.statut = ?";
      params.push(filters.status);
    }

    query += " ORDER BY o.date_pub DESC";

    // Pagination
    if (filters.limit) {
      query += " LIMIT ?";
      params.push(parseInt(filters.limit));
    }
    if (filters.page && filters.limit) {
      const offset = (parseInt(filters.page) - 1) * parseInt(filters.limit);
      query += " OFFSET ?";
      params.push(offset);
    }

    const [rows] = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM offre o
                      LEFT JOIN company c ON o.id_entreprise = c.id_company
                      LEFT JOIN user u ON c.id_user = u.id_user
                      WHERE 1=1`;
    const countParams = [];

    if (filters.search) {
      countQuery += " AND (o.titre LIKE ? OR c.nom LIKE ? OR u.nom LIKE ?)";
      countParams.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.status) {
      countQuery += " AND o.statut = ?";
      countParams.push(filters.status);
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    return {
      jobs: rows,
      total,
      page: parseInt(filters.page) || 1,
      limit: parseInt(filters.limit) || rows.length,
      totalPages: filters.limit ? Math.ceil(total / parseInt(filters.limit)) : 1
    };
  },

  getJobById: async (id) => {
    const [rows] = await pool.query(
      `SELECT o.*, c.nom as company_name,
              u.nom as recruiter_name
       FROM offre o
       LEFT JOIN company c ON o.id_entreprise = c.id_company
       LEFT JOIN user u ON c.id_user = u.id_user
       WHERE o.id_offre = ?`,
      [id]
    );
    return rows[0];
  },

  updateJobStatus: async (id, status, adminUserId = null) => {
    const [result] = await pool.query(
      "UPDATE offre SET statut = ? WHERE id_offre = ?",
      [status, id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Admin;