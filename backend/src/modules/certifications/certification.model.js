const pool = require("../../config/db");

const Certification = {
  findAll: async (filters = {}) => {
    let query = "SELECT c.*, u.nom as candidate_name FROM certification c JOIN user u ON c.id_user = u.id_user WHERE 1=1";
    const params = [];

    if (filters.search) {
      query += " AND (c.competence LIKE ? OR c.university LIKE ? OR u.nom LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.id_user) {
      query += " AND c.id_user = ?";
      params.push(filters.id_user);
    }

    query += " ORDER BY c.date_obtient DESC";
    const [rows] = await pool.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      "SELECT c.*, u.nom as candidate_name FROM certification c JOIN user u ON c.id_user = u.id_user WHERE c.id_certif = ?",
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const { date_obtient, university, competence, id_user } = data;
    const [result] = await pool.query(
      "INSERT INTO certification (date_obtient, university, competence, id_user) VALUES (?, ?, ?, ?)",
      [date_obtient, university, competence, id_user]
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
      `UPDATE certification SET ${fields.join(", ")} WHERE id_certif = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM certification WHERE id_certif = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Certification;