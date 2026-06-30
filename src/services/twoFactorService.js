const crypto = require('crypto');

class TwoFactorService {
  constructor() {
    this.otpLength = 6;
    this.otpExpiry = 10; // minutes
  }

  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate TOTP secret for authenticator apps
  generateTOTPSecret() {
    return crypto.randomBytes(20).toString('base64');
  }

  // Verify TOTP token
  verifyTOTP(secret, token) {
    // Implementation for TOTP verification
    // In production, use 'speakeasy' library
    const expectedToken = this.generateTOTPToken(secret);
    return token === expectedToken;
  }

  // Generate TOTP token
  generateTOTPToken(secret) {
    const now = Math.floor(Date.now() / 30000);
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base64'));
    hmac.update(Buffer.from(now.toString(16).padStart(16, '0'), 'hex'));
    const digest = hmac.digest();
    
    const offset = digest[digest.length - 1] & 0xf;
    const binary = 
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);
    
    const token = binary % 1000000;
    return token.toString().padStart(6, '0');
  }

  // Send OTP via SMS (placeholder)
  async sendSMS(phoneNumber, otp) {
    // Integrate with Ethiopian SMS provider (e.g., Ethio Telecom SMS API)
    console.log(`📱 SMS OTP for ${phoneNumber}: ${otp}`);
    
    // In production, use actual SMS gateway
    // await axios.post('https://sms-gateway.et/api/send', {
    //   to: phoneNumber,
    //   message: `Your Boss Jobs verification code: ${otp}`
    // });
    
    return { success: true, message: 'OTP sent successfully' };
  }

  // Send OTP via Email
  async sendEmail(email, otp) {
    const emailService = require('./emailService');
    
    return await emailService.sendEmail({
      to: email,
      subject: 'Your Verification Code - Boss Jobs Ethiopia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
            <h1>Boss Jobs Ethiopia</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
            <h2>Your Verification Code</h2>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; 
                        background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
              ${otp}
            </div>
            <p style="color: #666;">This code expires in ${this.otpExpiry} minutes.</p>
            <p style="color: #999; font-size: 0.9em;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });
  }
}

module.exports = new TwoFactorService();
