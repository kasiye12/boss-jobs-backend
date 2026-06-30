const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail({ to, subject, text, html }) {
    try {
      const mailOptions = {
        from: `"Boss Jobs Ethiopia" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html: html || text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Boss Jobs Ethiopia! 🎉';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background: #0066cc; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
          }
          .footer { text-align: center; margin-top: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Boss Jobs Ethiopia!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName},</h2>
            <p>Thank you for joining Boss Jobs Ethiopia! We're excited to help you find your dream job or the perfect candidate.</p>
            
            ${user.role === 'job_seeker' ? `
              <h3>Getting Started:</h3>
              <ul>
                <li>Complete your profile to increase visibility to employers</li>
                <li>Upload your CV and voice pitch to stand out</li>
                <li>Search for jobs matching your skills</li>
                <li>Apply with just one click!</li>
              </ul>
            ` : `
              <h3>Getting Started:</h3>
              <ul>
                <li>Post your first job listing</li>
                <li>Review applications from qualified candidates</li>
                <li>Use our screening tools to find the best match</li>
                <li>Connect with candidates instantly</li>
              </ul>
            `}
            
            <p>
              <a href="${process.env.APP_URL}/dashboard" class="button">Go to Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>Boss Jobs Ethiopia - Connecting Talent with Opportunity</p>
            <p>Follow us on Telegram: @${process.env.TELEGRAM_BOT_USERNAME}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: user.email, subject, html });
  }

  async sendApplicationStatusEmail(application, status) {
    const subject = `Application Status Update - ${application.job.title}`;
    const statusMessages = {
      reviewed: 'Your application has been reviewed by the employer.',
      shortlisted: 'Congratulations! You have been shortlisted for this position.',
      rejected: 'Unfortunately, your application was not selected for this position.',
    };

    const html = `
      <div class="container">
        <div class="header">
          <h1>Application Status Update</h1>
        </div>
        <div class="content">
          <h2>${application.job.title}</h2>
          <p><strong>Company:</strong> ${application.job.companyName}</p>
          <p><strong>Status:</strong> ${status.toUpperCase()}</p>
          <p>${statusMessages[status]}</p>
          <a href="${process.env.APP_URL}/applications/${application.id}" class="button">
            View Application
          </a>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: application.seeker.email,
      subject,
      html,
    });
  }
}

module.exports = new EmailService();
