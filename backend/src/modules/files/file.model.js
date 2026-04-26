const pool = require("../../config/db");

const File = {
  findAll: async (filters = {}) => {
    let query = "SELECT f.*, u.nom as uploader_name, c.nom as company_name FROM fichier f LEFT JOIN user u ON f.id_entreprise = u.id_user LEFT JOIN company c ON f.id_entreprise = c.id_company WHERE 1=1";
    const params = [];

    if (filters.search) {
      query += " AND (f.nom LIKE ? OR f.type LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.type) {
      query += " AND f.type = ?";
      params.push(filters.type);
    }
    if (filters.id_entreprise) {
      query += " AND f.id_entreprise = ?";
      params.push(filters.id_entreprise);
    }

    query += " ORDER BY f.date_creation DESC";
    const [rows] = await pool.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      "SELECT f.*, u.nom as uploader_name FROM fichier f LEFT JOIN user u ON f.id_entreprise = u.id_user WHERE f.id_fichier = ?",
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const { nom, type, url, id_entreprise } = data;
    const [result] = await pool.query(
      "INSERT INTO fichier (nom, date_creation, type, url, id_entreprise) VALUES (?, NOW(), ?, ?, ?)",
      [nom, type, url, id_entreprise]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);
    const [result] = await pool.query(
      `UPDATE fichier SET ${fields.join(", ")} WHERE id_fichier = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM fichier WHERE id_fichier = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = File;