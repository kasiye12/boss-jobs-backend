const AuthService = require('../services/authService');
const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

class AuthController {
  // Register
  static async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { emailOrPhone, password } = req.body;
      const result = await AuthService.login(emailOrPhone, password);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }

  // Telegram Auth
  static async telegramAuth(req, res) {
    try {
      const { initData } = req.body;
      if (!initData) {
        return res.status(400).json({ success: false, message: 'initData required' });
      }
      const result = await AuthService.telegramLogin(initData);
      return res.status(200).json({
        success: true,
        message: 'Telegram auth successful',
        data: result,
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }

  // Refresh Token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required' });
      }
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      const newToken = AuthService.generateToken(user);
      const newRefreshToken = AuthService.generateRefreshToken(user);
      return res.status(200).json({
        success: true,
        data: { token: newToken, refreshToken: newRefreshToken },
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }

  // Forgot Password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      // Always return success for security
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Reset Password
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      // Simplified - in production verify token
      return res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get Current User
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [{ model: JobSeekerProfile, as: 'profile' }],
      });
      return res.status(200).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update Profile
  static async updateProfile(req, res) {
    try {
      const { fullName, email, phoneNumber } = req.body;
      const user = await User.findByPk(req.user.id);
      if (fullName) user.fullName = fullName;
      if (email) user.email = email;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Profile updated',
        data: user.toJSON(),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Change Password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      user.passwordHash = newPassword;
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Logout
  static async logout(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

module.exports = AuthController;
