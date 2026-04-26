const Candidate = require("./candidate.model");

exports.getCandidateProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const profile = await Candidate.findByUser(req.user.id);

    if (!profile) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    res.json(profile);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    next(error);
  }
};

exports.updateCandidateProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    console.log("FILES RECEIVED:", req.files); // ✅ DEBUG

    const data = { ...req.body };

    // ❌ Prevent email change
    delete data.email;

    const files = req.files || {};

    /* ========================
       FILES HANDLING
    ======================== */

    // ✅ AVATAR
    if (files.avatar?.length > 0) {
      data.avatar = files.avatar[0].filename;
    }

    // ✅ CV
    if (files.cv?.length > 0) {
      data.cv = files.cv[0].filename;
    }

    // ✅ PORTFOLIO (VERY IMPORTANT ❗)
    if (files.portfolio?.length > 0) {
      data.portfolio = files.portfolio[0].filename;
    }

    // ✅ CERTIFICATIONS
    if (files.certifications?.length > 0) {
      data.certification = files.certifications
        .map((file) => file.filename)
        .join(",");
    }

    /* ========================
       UPDATE DATABASE
    ======================== */

    await Candidate.update(req.user.id, data);

    /* ========================
       RETURN UPDATED PROFILE
    ======================== */

    const updatedProfile = await Candidate.findByUser(req.user.id);

    res.json(updatedProfile);

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du profil",
      error: error.message
    });
  }
};

exports.getCandidateStats = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const stats = await Candidate.getStats(req.user.id);

    res.json(stats);
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    next(error);
  }
};