const pool = require("../../config/db");

const Application = {
  create: async (data) => {
    const { cv = null, lettre_motivation = null, id_user, id_offre } = data;
    const [result] = await pool.query(
      `INSERT INTO candidature (cv, lettre_motivation, date_postule, statut, id_user, id_offre)
       VALUES (?, ?, NOW(), 'EN_ATTENTE', ?, ?)`,
      [cv, lettre_motivation, id_user, id_offre]
    );
    return result.insertId;
  },

  findByUser: async (userId) => {
    const [rows] = await pool.query(
      `SELECT c.*,
              o.titre as job_title,
              o.localisation as localisation,
              comp.nom as company_name,
              comp.logo as company_logo
       FROM candidature c
       JOIN offre o ON c.id_offre = o.id_offre
       JOIN company comp ON o.id_entreprise = comp.id_company
       WHERE c.id_user = ?`,
      [userId]
    );
    return rows;
  },

  findByJob: async (jobId) => {
    const [rows] = await pool.query(
      `SELECT c.*, u.nom as candidate_name, u.email as candidate_email, u.telephone as candidate_phone, u.adresse as candidate_location, 
              u.experience as candidate_experience, u.avatar as candidate_avatar, u.bio as candidate_bio,
              u.specialite as candidate_specialty, u.niveau_etude as candidate_education,
              u.linkedin as candidate_linkedin, u.github as candidate_github, u.portfolio as candidate_portfolio,
              u.cv as candidate_cv_url
       FROM candidature c
       JOIN user u ON c.id_user = u.id_user
       WHERE c.id_offre = ?`,
      [jobId]
    );
    return rows;
  },

  findByCompany: async (companyId) => {
    const [rows] = await pool.query(
      `SELECT c.*, u.nom as candidate_name, u.email as candidate_email, u.telephone as candidate_phone, u.adresse as candidate_location, 
              u.experience as candidate_experience, u.avatar as candidate_avatar, u.bio as candidate_bio,
              u.specialite as candidate_specialty, u.niveau_etude as candidate_education,
              u.linkedin as candidate_linkedin, u.github as candidate_github, u.portfolio as candidate_portfolio,
              u.cv as candidate_cv_url,
              o.titre as job_title,
              m.score as matching_score
       FROM candidature c
       JOIN offre o ON c.id_offre = o.id_offre
       JOIN user u ON c.id_user = u.id_user
       LEFT JOIN matching m ON c.id_candidature = m.id_candidature
       WHERE o.id_entreprise = ?
       ORDER BY c.date_postule DESC`,
      [companyId]
    );
    return rows;
  },

  updateStatus: async (id, statut, extra = {}) => {
    const {
      entretien_date,
      entretien_lieu,
      note_recruteur,
      date_reponse,
      offer_salary,
      offer_currency,
      offer_contract_type,
      offer_start_date,
      offer_message,
      offer_status
    } = extra;
    console.log('[DB] Updating Status:', { id, statut, entretien_date, entretien_lieu, note_recruteur, offer_salary, offer_currency, offer_status });
    const [result] = await pool.query(
      `UPDATE candidature SET 
        statut = ?, 
        entretien_date = COALESCE(?, entretien_date), 
        entretien_lieu = COALESCE(?, entretien_lieu), 
        note_recruteur = COALESCE(?, note_recruteur),
        offer_salary = COALESCE(?, offer_salary),
        offer_currency = COALESCE(?, offer_currency),
        offer_contract_type = COALESCE(?, offer_contract_type),
        offer_start_date = COALESCE(?, offer_start_date),
        offer_message = COALESCE(?, offer_message),
        offer_status = COALESCE(?, offer_status),
        offer_sent_at = CASE
          WHEN ? = 'ACCEPTED' AND offer_sent_at IS NULL THEN NOW()
          ELSE offer_sent_at
        END,
        date_reponse = COALESCE(?, NOW())
       WHERE id_candidature = ?`,
      [
        statut,
        entretien_date || null,
        entretien_lieu || null,
        note_recruteur ?? null,
        offer_salary ?? null,
        offer_currency || null,
        offer_contract_type || null,
        offer_start_date || null,
        offer_message || null,
        offer_status || null,
        statut,
        date_reponse || null,
        id
      ]
    );
    console.log('[DB] Update Result:', result.affectedRows > 0 ? 'Success' : 'Failed');
    return result.affectedRows > 0;
  },

  respondToOffer: async (id, decision) => {
    const [result] = await pool.query(
      `UPDATE candidature SET
         offer_status = ?,
         offer_responded_at = NOW(),
         date_reponse = NOW()
       WHERE id_candidature = ?`,
      [decision, id]
    );
    return result.affectedRows > 0;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT c.*, o.id_entreprise, comp.id_user as recruiter_id
       FROM candidature c
       JOIN offre o ON c.id_offre = o.id_offre
       JOIN company comp ON o.id_entreprise = comp.id_company
       WHERE c.id_candidature = ?`,
      [id]
    );
    return rows[0];
  }
};

module.exports = Application;