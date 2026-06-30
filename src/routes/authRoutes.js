const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Validation rules
const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['job_seeker', 'employer']).withMessage('Invalid role'),
];

const loginValidation = [
  body('emailOrPhone').trim().notEmpty().withMessage('Email or phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/telegram', AuthController.telegramAuth);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/me', authMiddleware.authenticate, AuthController.getCurrentUser);
router.put('/me', authMiddleware.authenticate, AuthController.updateProfile);
router.post('/logout', authMiddleware.authenticate, AuthController.logout);

module.exports = router;
