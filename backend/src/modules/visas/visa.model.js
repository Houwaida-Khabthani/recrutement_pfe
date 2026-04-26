const pool = require("../../config/db");

const Visa = {
  createDemande: async (data) => {
    const { type_visa, date_debut, date_fin, id_user } = data;
    const [result] = await pool.query(
      `INSERT INTO demande_visa (date_demande, statut, type_visa, date_debut, date_fin, id_user)
       VALUES (NOW(), 'EN_ATTENTE', ?, ?, ?, ?)`,
      [type_visa, date_debut, date_fin, id_user]
    );
    return result.insertId;
  },

  findAllDemandes: async () => {
    const [rows] = await pool.query(
      `SELECT d.*, u.nom, u.email 
       FROM demande_visa d
       JOIN user u ON d.id_user = u.id_user
       ORDER BY d.date_demande DESC`
    );
    return rows;
  },

  findDemandesByUser: async (userId) => {
    const [rows] = await pool.query(
      "SELECT * FROM demande_visa WHERE id_user = ? ORDER BY date_demande DESC",
      [userId]
    );
    return rows;
  },

  updateStatus: async (id, statut, commentaire_admin) => {
    const [result] = await pool.query(
      "UPDATE demande_visa SET statut = ?, commentaire_admin = ? WHERE id_demande = ?",
      [statut, commentaire_admin, id]
    );
    return result.affectedRows > 0;
  },

  createVisaRecord: async (data) => {
    const { pays, type, statut, date_validation, id_demande } = data;
    const [result] = await pool.query(
      `INSERT INTO visa (pays, date_creation, type, statut, date_validation, id_demande)
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [pays, type, statut, date_validation, id_demande]
    );
    return result.insertId;
  },

  getVisaById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM visa WHERE id_visa = ?", [id]);
    return rows[0];
  }
};

module.exports = Visa;