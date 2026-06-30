const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ApplicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Apply for job
router.post('/apply/:jobId', 
  authMiddleware.authorize('job_seeker'),
  ApplicationController.applyForJob
);

// Get user's applications
router.get('/my-applications', 
  authMiddleware.authorize('job_seeker'),
  ApplicationController.getMyApplications
);

// Get applications for job (employer)
router.get('/job/:jobId', 
  authMiddleware.authorize('employer', 'admin'),
  ApplicationController.getJobApplications
);

// Update application status
router.put('/:id/status',
  authMiddleware.authorize('employer', 'admin'),
  ApplicationController.updateApplicationStatus
);

// Withdraw application
router.delete('/:id/withdraw',
  authMiddleware.authorize('job_seeker'),
  ApplicationController.withdrawApplication
);

module.exports = router;
