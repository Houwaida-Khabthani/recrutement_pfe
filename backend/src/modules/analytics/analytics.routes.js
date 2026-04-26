const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const auth = require('../../middlewares/auth.middleware');

/**
 * All analytics routes require authentication
 * and the user must be from a company (not admin or candidate)
 */

// GET /api/analytics/rapport - Get complete analytics report
router.get('/rapport', auth, analyticsController.getRapportAnalytics);

// GET /api/analytics/kpis - Get KPIs only
router.get('/kpis', auth, analyticsController.getKPIs);

// GET /api/analytics/export - Export as CSV or PDF
router.get('/export', auth, analyticsController.exportAnalytics);

module.exports = router;
