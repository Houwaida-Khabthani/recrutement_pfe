const matchingEngine = require("./matching.engine");
const skillExtractor = require("./skill.extractor");
const User = require("../users/user.model");
const Job = require("../jobs/job.model");
const pool = require("../../config/db");

exports.matchCandidateToJob = async (userId, jobId) => {
  const user = await User.findById(userId);
  const job = await Job.findById(jobId);

  if (!user || !job) throw new Error("Utilisateur ou Offre introuvable");

  // Logic: Extract skills from bio/cv and job description
  const candidateText = `${user.specialite} ${user.bio} ${user.experience}`;
  const jobText = `${job.titre} ${job.description}`;

  const score = matchingEngine.compareTexts(candidateText, jobText);

  // Save matching results in DB
  const [result] = await pool.query(
    "INSERT INTO matching (score, note, date, id_offre) VALUES (?, ?, NOW(), ?)",
    [score, score / 10, jobId]
  );

  return { id: result.insertId, score };
};

exports.getMatchingResult = async (jobId) => {
    // Return candidates sorted by match score for a specific job
    const [rows] = await pool.query(
        `SELECT u.id_user, u.nom, u.email, m.score
         FROM user u
         JOIN candidature c ON u.id_user = c.id_user
         JOIN matching m ON c.id_candidature = m.id_candidature
         WHERE m.id_offre = ?
         ORDER BY m.score DESC`,
        [jobId]
    );
    return rows;
};