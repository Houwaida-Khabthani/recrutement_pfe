const pool = require("../../config/db");

const User = {

  findById: async (userId) => {
    const [rows] = await pool.query(
      `SELECT 
        id_user,
        nom,
        email,
        telephone,
        pays,
        adresse,
        civilite,
        date_naissance,
        cv,
        niveau_etude,
        specialite,
        experience,
        bio,
        avatar,
        linkedin,
        github,
        portfolio,
        projets,
        langues,
        certification,
        competences
      FROM user
      WHERE id_user = ?`,
      [userId]
    );

    return rows[0];
  },

  update: async (id, data) => {

    const allowedFields = [
      "nom",
      "telephone",
      "pays",
      "adresse",
      "civilite",
      "date_naissance",
      "cv",
      "niveau_etude",
      "specialite",
      "experience",
      "bio",
      "avatar",
      "linkedin",
      "github",
      "portfolio",
      "projets",
      "langues",
      "certification",
      "competences"
    ];

    const updates = {};

    for (const key of Object.keys(data)) {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        updates[key] = data[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return false;
    }

    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = [...Object.values(updates), id];

    const [result] = await pool.query(
      `UPDATE user SET ${fields} WHERE id_user = ?`,
      values
    );

    return result.affectedRows > 0;
  },

  getStats: async (id) => {

    const [applications] = await pool.query(
      "SELECT COUNT(*) AS total FROM candidature WHERE id_user = ?",
      [id]
    );

    const [interviews] = await pool.query(
      "SELECT COUNT(*) AS total FROM candidature WHERE id_user = ? AND entretien_date IS NOT NULL",
      [id]
    );

    const [offers] = await pool.query(
      "SELECT COUNT(*) AS total FROM candidature WHERE id_user = ? AND statut = 'ACCEPTEE'",
      [id]
    );

    return {
      applications: applications[0].total,
      interviews: interviews[0].total,
      offers: offers[0].total
    };
  }
};

module.exports = User;