const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.authenticate);

// Admin analytics
router.get('/platform', authMiddleware.authorize('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const analytics = await AnalyticsService.getPlatformOverview(days);
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Employer analytics
router.get('/employer', authMiddleware.authorize('employer', 'admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const analytics = await AnalyticsService.getEmployerAnalytics(req.user.id, days);
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
