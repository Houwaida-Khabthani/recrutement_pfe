const pool = require("../../config/db");

const Candidate = {

  findByUser: async (userId) => {
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
        portfolio
      FROM user
      WHERE id_user = ?`,
      [userId]
    );

    return rows[0];
  },

  update: async (userId, data) => {

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
      "portfolio"
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

    const values = [...Object.values(updates), userId];

    const [result] = await pool.query(
      `UPDATE user SET ${fields} WHERE id_user = ?`,
      values
    );

    return result.affectedRows > 0;
  },

  getStats: async (userId) => {

    const [rows] = await pool.query(
      `SELECT statut, COUNT(*) as count
       FROM candidature
       WHERE id_user = ?
       GROUP BY statut`,
      [userId]
    );

    const stats = {
      total: 0,
      en_attente: 0,
      entretien: 0,
      accepte: 0,
      refuse: 0
    };

    rows.forEach((row) => {
      stats.total += row.count;

      const status = row.statut.toUpperCase();

      if (status === "EN_ATTENTE") stats.en_attente += row.count;
      else if (status.includes("ENTRETIEN")) stats.entretien += row.count;
      else if (status === "ACCEPTE" || status === "RECRUTE") stats.accepte += row.count;
      else if (status === "REFUSE") stats.refuse += row.count;
    });

    return stats;
  }

};

module.exports = Candidate;