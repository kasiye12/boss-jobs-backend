const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { Op } = require('sequelize');
require('dotenv').config();

class AuthService {
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  static generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
  }

  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
  }

  static validateTelegramInitData(initData) {
    const urlParams = new URLSearchParams(initData);
    const userData = JSON.parse(urlParams.get('user') || '{}');
    return {
      id: userData.id?.toString() || '',
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      username: userData.username || '',
    };
  }

  static async register(userData) {
    const { fullName, email, phoneNumber, password, role } = userData;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: email || null },
          { phoneNumber: phoneNumber },
        ].filter(condition => Object.values(condition)[0] !== null),
      },
    });

    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      passwordHash: password,
      role: role || 'job_seeker',
    });

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user: user.toJSON(), token, refreshToken };
  }

  static async login(emailOrPhone, password) {
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: emailOrPhone },
          { phoneNumber: emailOrPhone },
        ],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user: user.toJSON(), token, refreshToken };
  }

  static async telegramLogin(initData) {
    const telegramUser = this.validateTelegramInitData(initData);

    let user = await User.findOne({ where: { telegramId: telegramUser.id } });

    if (!user) {
      user = await User.create({
        fullName: `${telegramUser.firstName} ${telegramUser.lastName}`.trim(),
        phoneNumber: `telegram_${telegramUser.id}`,
        passwordHash: crypto.randomBytes(32).toString('hex'),
        telegramId: telegramUser.id,
        role: 'job_seeker',
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user: user.toJSON(), token, refreshToken };
  }
}

module.exports = AuthService;
