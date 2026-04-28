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
  },

  // Document management methods
  createDocument: async (data) => {
    const { id_user, id_demande_visa, type_document, nom_fichier, chemin_fichier, taille_fichier } = data;
    const [result] = await pool.query(
      `INSERT INTO document_visa (id_user, id_demande_visa, type_document, nom_fichier, chemin_fichier, taille_fichier)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_user, id_demande_visa, type_document, nom_fichier, chemin_fichier, taille_fichier]
    );
    return result.insertId;
  },

  getDocumentsByUser: async (userId, status = null) => {
    let query = `
      SELECT d.*, dv.date_demande, dv.statut as visa_status, dv.type_visa
      FROM document_visa d
      LEFT JOIN demande_visa dv ON d.id_demande_visa = dv.id_demande
      WHERE d.id_user = ?
    `;
    const params = [userId];

    if (status) {
      query += " AND d.statut = ?";
      params.push(status);
    }

    query += " ORDER BY d.date_upload DESC";

    const [rows] = await pool.query(query, params);
    return rows;
  },

  getDocumentById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM document_visa WHERE id_document = ?", [id]);
    return rows[0];
  },

  updateDocumentStatus: async (id, status, commentaire_admin = null) => {
    const [result] = await pool.query(
      "UPDATE document_visa SET statut = ?, commentaire_admin = ? WHERE id_document = ?",
      [status, commentaire_admin, id]
    );
    return result.affectedRows > 0;
  },

  deleteDocument: async (id) => {
    const [result] = await pool.query("DELETE FROM document_visa WHERE id_document = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Visa;