const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// All dashboard routes require authentication
router.use(authMiddleware.authenticate);

// General platform stats (admin only)
router.get(
  '/platform',
  authMiddleware.authorize('admin'),
  DashboardController.getPlatformStats
);

// Employer dashboard
router.get(
  '/employer',
  authMiddleware.authorize('employer', 'admin'),
  DashboardController.getEmployerDashboard
);

// Job seeker dashboard
router.get(
  '/seeker',
  authMiddleware.authorize('job_seeker', 'admin'),
  DashboardController.getSeekerDashboard
);

module.exports = router;
