const User = require("./user.model");

exports.getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilisateur introuvable");
  }

  return user;
};

exports.updateUserProfile = async (userId, data) => {

  const allowedFields = [
    "nom",
    "telephone",
    "specialite",
    "experience",
    "niveau_etude",
    "civilite",
    "date_naissance",
    "adresse",
    "pays",
    "bio",
    "cv",
    "portfolio",
    "linkedin",
    "github",
    "avatar",
    "projets",
    "langues",
    "certification",
    "competences"
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  return await User.update(userId, updateData);
};

exports.getUserStats = async (userId) => {
  return await User.getStats(userId);
};