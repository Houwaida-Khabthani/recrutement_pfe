const pool = require("../../config/db");

const Job = {
  findAll: async (filters = {}) => {
    let query = "SELECT o.*, c.nom as company_name, c.logo as company_logo FROM offre o JOIN company c ON o.id_entreprise = c.id_company WHERE 1=1";
    const params = [];

    if (filters.search) {
      query += " AND (o.titre LIKE ? OR o.description LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.localisation) {
      query += " AND o.localisation = ?";
      params.push(filters.localisation);
    }
    if (filters.type_contrat) {
      query += " AND o.type_contrat = ?";
      params.push(filters.type_contrat);
    }

    query += " ORDER BY o.date_pub DESC";
    const [rows] = await pool.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      "SELECT o.*, c.nom as company_name, c.logo as company_logo, c.description as company_description FROM offre o JOIN company c ON o.id_entreprise = c.id_company WHERE o.id_offre = ?",
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const { titre, type_contrat, localisation, description, salaire, experience, id_entreprise, date_expiration } = data;
    const [result] = await pool.query(
      `INSERT INTO offre (titre, type_contrat, localisation, description, salaire, experience, id_entreprise, date_pub, statut, date_expiration)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'OUVERT', ?)`,
      [titre, type_contrat, localisation, description, salaire, experience, id_entreprise, date_expiration]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    // Only allow specific fields to be updated
    const allowedFields = ['titre', 'type_contrat', 'localisation', 'description', 'salaire', 'experience', 'date_expiration', 'statut'];
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }
    
    values.push(id);
    
    try {
      const query = `UPDATE offre SET ${fields.join(", ")} WHERE id_offre = ?`;
      console.log('[DB] Executing update query:', query);
      const [result] = await pool.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[DB] Update query error:', error.message);
      throw error;
    }
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM offre WHERE id_offre = ?", [id]);
    return result.affectedRows > 0;
  },

  findByRecruiter: async (userId) => {
    // Try to find company for this user
    console.log('[DB] Searching for company with id_user:', userId);
    const [companies] = await pool.query(
      "SELECT id_company FROM company WHERE id_user = ? LIMIT 1",
      [userId]
    );

    // If no company, return empty array
    if (!companies || companies.length === 0) {
      console.log('[DB] No company found for user:', userId);
      return [];
    }

    // Get jobs for this company
    const companyId = companies[0].id_company;
    console.log('[DB] Found company:', companyId, 'for user:', userId);
    const [rows] = await pool.query(
      "SELECT o.* FROM offre o WHERE o.id_entreprise = ? ORDER BY o.date_pub DESC",
      [companyId]
    );
    console.log('[DB] Found ' + (rows ? rows.length : 0) + ' jobs for company:', companyId);
    return rows || [];
  },

  getCompanyIdByUser: async (userId) => {
    console.log('[Model] getCompanyIdByUser called with userId:', userId);
    const [rows] = await pool.query("SELECT id_company, id_user FROM company WHERE id_user = ?", [userId]);
    console.log('[Model] Query returned rows:', rows);
    console.log('[Model] Number of rows:', rows.length);
    if (!rows || rows.length === 0) {
      console.log('[Model] ❌ No company found for userId:', userId);
      return undefined;
    }
    const companyId = rows[0]?.id_company;
    console.log('[Model] ✅ Found companyId:', companyId, 'for userId:', userId);
    return companyId;
  }
};

module.exports = Job;