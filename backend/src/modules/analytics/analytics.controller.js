const analyticsService = require('./analytics.service');
const pool = require('../../config/db');

/**
 * Helper: Get company ID for authenticated user
 */
const getCompanyId = async (userId) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_company FROM company WHERE id_user = ? LIMIT 1',
      [userId]
    );
    
    if (!rows || rows.length === 0) {
      return null;
    }
    
    return rows[0].id_company;
  } catch (error) {
    console.error('Error getting company ID:', error);
    return null;
  }
};

/**
 * GET /api/analytics/rapport
 * Get complete recruitment analytics report with KPIs, timeline, job performance, etc.
 */
const getRapportAnalytics = async (req, res) => {
  try {
    const { dateRange = 'month', jobId } = req.query;
    const userId = req.user.id;

    // Get company ID for this user
    const companyId = await getCompanyId(userId);
    
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'No company associated with this user',
      });
    }

    // Get analytics data
    const rapport = await analyticsService.generateRapport(companyId, {
      dateRange,
      jobId: jobId ? parseInt(jobId) : undefined,
    });

    res.status(200).json({
      success: true,
      data: rapport,
    });
  } catch (error) {
    console.error('Error getting rapport analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/analytics/kpis
 * Get key performance indicators only
 */
const getKPIs = async (req, res) => {
  try {
    const { dateRange = 'month' } = req.query;
    const userId = req.user.id;

    // Get company ID for this user
    const companyId = await getCompanyId(userId);
    
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'No company associated with this user',
      });
    }

    const kpis = await analyticsService.getKPIs(companyId, dateRange);

    res.status(200).json({
      success: true,
      data: kpis,
    });
  } catch (error) {
    console.error('Error getting KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KPIs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/analytics/export
 * Export analytics as CSV or PDF
 */
const exportAnalytics = async (req, res) => {
  try {
    const { format = 'csv', dateRange = 'month', jobId } = req.query;
    const userId = req.user.id;

    // Get company ID for this user
    const companyId = await getCompanyId(userId);
    
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'No company associated with this user',
      });
    }

    if (!['csv', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export format. Use "csv" or "pdf"',
      });
    }

    const rapport = await analyticsService.generateRapport(companyId, {
      dateRange,
      jobId: jobId ? parseInt(jobId) : undefined,
    });

    if (format === 'csv') {
      const csv = analyticsService.convertToCSV(rapport);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="rapport-${new Date().toISOString().split('T')[0]}.csv"`
      );
      return res.send(csv);
    }

    if (format === 'pdf') {
      // PDF export - would require a PDF library like pdfkit
      // For now, return JSON with note that PDF export needs additional setup
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="rapport-${new Date().toISOString().split('T')[0]}.pdf"`
      );
      // Placeholder - implement with actual PDF library when needed
      return res.json({
        success: false,
        message: 'PDF export not yet implemented. Use CSV export instead.',
      });
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getRapportAnalytics,
  getKPIs,
  exportAnalytics,
};
