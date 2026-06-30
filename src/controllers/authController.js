const AuthService = require('../services/authService');
const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const { validationResult } = require('express-validator');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const result = await AuthService.register(req.body);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { emailOrPhone, password } = req.body;
      const result = await AuthService.login(emailOrPhone, password);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Telegram Mini-App authentication
  static async telegramAuth(req, res) {
    try {
      const { initData } = req.body;

      if (!initData) {
        return res.status(400).json({
          success: false,
          message: 'Telegram initData is required',
        });
      }

      const result = await AuthService.telegramLogin(initData);

      return res.status(200).json({
        success: true,
        message: 'Telegram authentication successful',
        data: result,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Telegram authentication failed',
        error: error.message,
      });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      const newToken = AuthService.generateToken(user);
      const newRefreshToken = AuthService.generateRefreshToken(user);

      return res.status(200).json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  }

  // Get current user profile
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: JobSeekerProfile,
            as: 'profile',
          },
        ],
      });

      return res.status(200).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching user profile',
        error: error.message,
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { fullName, email } = req.body;
      const user = await User.findByPk(req.user.id);

      if (fullName) user.fullName = fullName;
      if (email) user.email = email;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user.toJSON(),
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Logout
  static async logout(req, res) {
    // In a stateless JWT setup, logout is handled client-side by removing the token
    // For added security, you could implement a token blacklist with Redis
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

module.exports = AuthController;
