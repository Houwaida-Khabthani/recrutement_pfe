const userService = require("./user.service");

exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

exports.updateMyProfile = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // File uploads mapping
    if (req.files?.logo) data.logo = req.files.logo[0].filename;
    if (req.files?.cv) data.cv = req.files.cv[0].filename;
    if (req.files?.portfolio) data.portfolio = req.files.portfolio[0].filename;
    if (req.files?.avatar) data.avatar = req.files.avatar[0].filename;

    await userService.updateUserProfile(req.user.id, data);
    res.json({ message: "Profil mis à jour avec succès" });
  } catch (error) {
    next(error);
  }
};

exports.getMyStats = async (req, res, next) => {
  try {
    const stats = await userService.getUserStats(req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};