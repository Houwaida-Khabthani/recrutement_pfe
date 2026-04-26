const jwt = require("jsonwebtoken");
const authService = require("./auth.service");
const config = require("../../config/env");

/**
 * LOGIN
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await authService.login(email, password);

    const token = jwt.sign(
      {
        id_user: user.id_user,   // ✅ IMPORTANT
        role: user.role,
        email: user.email,
      },
      config.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      user: {
        id: user.id_user,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
      token,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * REGISTER
 */
exports.register = async (req, res, next) => {
  try {
    const data = req.body;

    // ✅ attach file if exists
    if (req.file) {
      data.logo = req.file.filename;
    }

    await authService.register(data);

    // 🔔 Notification: Notify admins about new company registration
    if (data.role === "ENTREPRISE" && data.nom_entreprise) {
      try {
        const notificationHelper = require("../../services/notificationHelper");
        await notificationHelper.notifyAdminsNewCompany(data.nom_entreprise);
      } catch (notifError) {
        console.error("⚠️ Notification error (non-blocking):", notifError.message);
        // Don't break the registration if notification fails
      }
    }

    res.status(201).json({
      message: "Utilisateur créé avec succès",
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET CURRENT USER
 */
exports.me = async (req, res, next) => {
  try {
    const user = await authService.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      id: user.id_user,
      nom: user.nom,
      email: user.email,
      role: user.role,
      ...user
    });

  } catch (error) {
    next(error);
  }
};

/**
 * FORGOT PASSWORD
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.json({
      message:
        "Si cet email existe, un lien de réinitialisation a été envoyé.",
    });

  } catch (error) {
    next(error);
  }
};

/**
 * CHANGE PASSWORD
 */
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    next(error);
  }
};