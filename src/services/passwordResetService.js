const crypto = require('crypto');
const { Op } = require('sequelize');

class PasswordResetService {
  constructor() {
    this.resetTokenExpiry = 60; // minutes
  }

  // Generate reset token
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create password reset record
  async createResetRequest(userId) {
    const { sequelize } = require('../config/database');
    const token = this.generateResetToken();
    const expiresAt = new Date(Date.now() + this.resetTokenExpiry * 60000);

    await sequelize.query(`
      INSERT INTO password_resets (user_id, token, expires_at, is_used)
      VALUES (:userId, :token, :expiresAt, false)
      ON CONFLICT (user_id) DO UPDATE
      SET token = :token, expires_at = :expiresAt, is_used = false, updated_at = NOW()
    `, {
      replacements: { userId, token, expiresAt },
    });

    return { token, expiresAt };
  }

  // Verify reset token
  async verifyResetToken(token) {
    const { sequelize } = require('../config/database');
    
    const [result] = await sequelize.query(`
      SELECT user_id, expires_at, is_used
      FROM password_resets
      WHERE token = :token
        AND expires_at > NOW()
        AND is_used = false
      LIMIT 1
    `, {
      replacements: { token },
    });

    if (!result || result.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    return result[0].user_id;
  }

  // Mark token as used
  async markTokenAsUsed(token) {
    const { sequelize } = require('../config/database');
    
    await sequelize.query(`
      UPDATE password_resets
      SET is_used = true
      WHERE token = :token
    `, {
      replacements: { token },
    });
  }

  // Send reset email
  async sendResetEmail(email, token) {
    const emailService = require('./emailService');
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    return await emailService.sendEmail({
      to: email,
      subject: 'Password Reset - Boss Jobs Ethiopia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
            <h1>Boss Jobs Ethiopia</h1>
          </div>
          <div style="padding: 30px;">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #0066cc; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="color: #666;">This link expires in ${this.resetTokenExpiry} minutes.</p>
            <p style="color: #999; font-size: 0.9em;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });
  }
}

module.exports = new PasswordResetService();
