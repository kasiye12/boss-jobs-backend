const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ProfileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadService = require('../services/uploadService');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Get profile
router.get('/', ProfileController.getProfile);

// Create/Update profile
router.post('/', 
  authMiddleware.authorize('job_seeker'),
  ProfileController.createOrUpdateProfile
);

// Upload voice pitch
router.post('/voice',
  authMiddleware.authorize('job_seeker'),
  uploadService.getAudioUpload(),
  ProfileController.uploadVoicePitch
);

// Upload profile picture
router.post('/picture',
  authMiddleware.authorize('job_seeker'),
  uploadService.getImageUpload(),
  ProfileController.uploadProfilePicture
);

// Upload resume
router.post('/resume',
  authMiddleware.authorize('job_seeker'),
  uploadService.getDocumentUpload(),
  ProfileController.uploadResume
);

module.exports = router;
