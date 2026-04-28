const jwt = require("jsonwebtoken");
const authService = require("./auth.service");
const config = require("../../config/env");

/**
 * LOGIN
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
        message: "Email and password are required",
        status: 400,
        path: req.path
      });
    }

    const user = await authService.login(email, password);

    // ✅ Verify user object has required fields for token
    if (!user.id_user || !user.role || !user.email) {
      console.error('[LOGIN] Invalid user object returned from authService:', user);
      return res.status(500).json({
        error: "Internal server error",
        message: "Invalid user data received",
        status: 500,
        path: req.path
      });
    }

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
    console.error('[LOGIN ERROR]', {
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n')[0]
    });
    
    // Handle authentication errors with proper status codes
    if (error.message === "Utilisateur non trouvé" || error.message === "Mot de passe incorrect") {
      return res.status(401).json({
        error: "Email ou mot de passe incorrect",
        message: "Email ou mot de passe incorrect",
        status: 401,
        path: req.path
      });
    }
    if (error.message === "Your account is pending admin approval") {
      return res.status(403).json({
        error: "Account pending approval",
        message: "Your account is pending admin approval",
        status: 403,
        path: req.path
      });
    }
    
    // ✅ Log and handle unexpected errors
    console.error('[LOGIN] Unexpected error:', error.message);
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