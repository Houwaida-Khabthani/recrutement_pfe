const service = require("./company.service");

exports.getProfile = async (req, res) => {
  try {
    console.error(`[COMPANY CONTROLLER] getProfile for user ID ${req.user.id}`);
    const data = await service.getProfile(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error(`[COMPANY CONTROLLER ERROR] getProfile: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.error(`[COMPANY CONTROLLER] updateProfile for user ID ${req.user.id}`);
    const payload = { ...req.body };
    if (req.file?.filename) {
      payload.logo = req.file.filename;
    }
    console.error(`[COMPANY CONTROLLER] Payload:`, JSON.stringify(payload));
    const data = await service.updateProfile(req.user.id, payload);
    res.json({ success: true, data });
  } catch (error) {
    console.error(`[COMPANY CONTROLLER ERROR] updateProfile: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    // Standardizing to use req.user.id if available, fallback for testing
    const userId = req.user?.id || 2; 
    console.error(`[COMPANY CONTROLLER] getDashboard for user ID ${userId}`);
    const data = await service.getDashboard(userId);
    res.json({ success: true, data });
  } catch (error) {
    console.error(`[COMPANY CONTROLLER ERROR] getDashboard: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const data = await service.getStats(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error(`[COMPANY CONTROLLER ERROR] getStats: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHrDashboard = async (req, res) => {
  try {
    console.error(`[COMPANY CONTROLLER] getHrDashboard`);
    const data = await service.getHrDashboard();
    res.json({ success: true, data });
  } catch (error) {
    console.error(`[COMPANY CONTROLLER ERROR] getHrDashboard: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    console.error(`[COMPANY CONTROLLER] getAnalytics`);
    const data = await service.getAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    console.error(`[COMPANY CONTROLLER ERROR] getAnalytics: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};