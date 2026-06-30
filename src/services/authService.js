const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
require('dotenv').config();

class AuthService {
  // Generate JWT token
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        telegramId: user.telegramId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );
  }

  // Generate refresh token
  static generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      }
    );
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Validate Telegram initData (HMAC-SHA256)
  static validateTelegramInitData(initData, botToken = process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      urlParams.delete('hash');
      
      // Sort parameters alphabetically
      const sortedParams = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Create secret key from bot token
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      // Calculate hash
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(sortedParams)
        .digest('hex');

      if (calculatedHash !== hash) {
        throw new Error('Invalid Telegram data');
      }

      // Parse user data
      const userData = JSON.parse(urlParams.get('user'));
      return {
        id: userData.id.toString(),
        firstName: userData.first_name,
        lastName: userData.last_name || '',
        username: userData.username || '',
        photoUrl: userData.photo_url || '',
      };
    } catch (error) {
      throw new Error(`Telegram validation failed: ${error.message}`);
    }
  }

  // Register new user
  static async register(userData) {
    const { fullName, email, phoneNumber, password, role = 'job_seeker' } = userData;

    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: email },
          { phoneNumber: phoneNumber },
        ],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or phone number already exists');
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      passwordHash: password,
      role,
    });

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user: user.toJSON(), token, refreshToken };
  }

  // Login user
  static async login(emailOrPhone, password) {
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: emailOrPhone },
          { phoneNumber: emailOrPhone },
        ],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated. Contact support.');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user: user.toJSON(), token, refreshToken };
  }

  // Telegram auto-login
  static async telegramLogin(initData) {
    const telegramUser = this.validateTelegramInitData(initData);
    
    // Find or create user by telegram ID
    let user = await User.findOne({
      where: { telegramId: telegramUser.id },
    });

    if (!user) {
      // Create new user
      user = await User.create({
        fullName: `${telegramUser.firstName} ${telegramUser.lastName}`.trim(),
        phoneNumber: `telegram_${telegramUser.id}`, // Placeholder, should be updated later
        passwordHash: crypto.randomBytes(32).toString('hex'), // Random password
        telegramId: telegramUser.id,
        role: 'job_seeker',
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user: user.toJSON(), token, refreshToken };
  }
}

module.exports = AuthService;
