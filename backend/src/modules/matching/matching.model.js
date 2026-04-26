const pool = require("../../config/db");

const Matching = {
  findAll: async (filters = {}) => {
    let query = `SELECT m.*, u.nom as candidate_name, o.titre as job_title, c.date_postule
                 FROM matching m
                 JOIN candidature c ON m.id_candidature = c.id_candidature
                 JOIN user u ON c.id_user = u.id_user
                 JOIN offre o ON m.id_offre = o.id_offre
                 WHERE 1=1`;
    const params = [];

    if (filters.search) {
      query += " AND (u.nom LIKE ? OR o.titre LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.min_score) {
      query += " AND m.score >= ?";
      params.push(filters.min_score);
    }

    query += " ORDER BY m.score DESC, m.date DESC";
    const [rows] = await pool.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT m.*, u.nom as candidate_name, o.titre as job_title
       FROM matching m
       JOIN candidature c ON m.id_candidature = c.id_candidature
       JOIN user u ON c.id_user = u.id_user
       JOIN offre o ON m.id_offre = o.id_offre
       WHERE m.id_matching = ?`,
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const { score, note, id_candidature, id_offre } = data;
    const [result] = await pool.query(
      "INSERT INTO matching (score, note, date, id_candidature, id_offre) VALUES (?, ?, NOW(), ?, ?)",
      [score, note, id_candidature, id_offre]
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
      `UPDATE matching SET ${fields.join(", ")} WHERE id_matching = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM matching WHERE id_matching = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Matching;