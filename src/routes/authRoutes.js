const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/telegram', AuthController.telegramAuth);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/me', authMiddleware.authenticate, AuthController.getCurrentUser);
router.put('/me', authMiddleware.authenticate, AuthController.updateProfile);
router.put('/change-password', authMiddleware.authenticate, AuthController.changePassword);
router.post('/logout', authMiddleware.authenticate, AuthController.logout);

module.exports = router;
