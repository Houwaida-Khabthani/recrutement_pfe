const jwt = require("jsonwebtoken");
const config = require("../config/env");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log('[AUTH] Headers received:', {
      hasAuth: !!authHeader,
      authHeader: authHeader ? authHeader.substring(0, 20) + '...' : 'MISSING'
    });

    if (!authHeader) {
      console.log('[AUTH] ❌ No authorization header');
      return res.status(401).json({ message: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log('[AUTH] ❌ No token in header');
      return res.status(401).json({ message: "Token manquant" });
    }

    console.log('[AUTH] Verifying token...');
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // ✅ STANDARD FORMAT
    req.user = {
      id: decoded.id_user,
      role: decoded.role,
      email: decoded.email,
    };

    console.log('[AUTH] ✅ Token verified for user:', req.user.id);
    next();

  } catch (error) {
    console.log('[AUTH] ❌ Token error:', error.message);
    return res.status(401).json({ message: "Token invalide" });
  }
};