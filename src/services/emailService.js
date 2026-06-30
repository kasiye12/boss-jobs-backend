const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password',
      },
    });
  }

  async sendEmail({ to, subject, text, html }) {
    try {
      const mailOptions = {
        from: '"Boss Jobs Ethiopia" <noreply@bossjobs.et>',
        to,
        subject,
        text,
        html: html || text,
      };

      // In development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:');
        console.log('   To:', to);
        console.log('   Subject:', subject);
        console.log('   Body:', text || html);
        return { success: true, messageId: 'dev-mode' };
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Welcome email
  async sendWelcomeEmail(user) {
    return await this.sendEmail({
      to: user.email,
      subject: 'እንኳን ደህና መጡ! Welcome to Boss Jobs Ethiopia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
            <h1>Boss Jobs Ethiopia</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Welcome, ${user.fullName}! 🎉</h2>
            <p>Thank you for joining Ethiopia's premier job portal.</p>
            ${user.role === 'job_seeker' ? `
              <h3>Get Started:</h3>
              <ul>
                <li>✅ Complete your profile</li>
                <li>✅ Upload your CV</li>
                <li>✅ Search for jobs</li>
                <li>✅ Apply with one click</li>
              </ul>
            ` : `
              <h3>Get Started:</h3>
              <ul>
                <li>✅ Post your first job</li>
                <li>✅ Review applications</li>
                <li>✅ Find the best talent</li>
              </ul>
            `}
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" 
               style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
      `,
    });
  }

  // Application status email
  async sendApplicationStatusEmail(application, seeker, job) {
    const statusMessages = {
      reviewed: 'Your application has been reviewed by the employer.',
      shortlisted: '🎉 Congratulations! You have been shortlisted!',
      rejected: 'Unfortunately, your application was not selected.',
    };

    return await this.sendEmail({
      to: seeker.email,
      subject: `Application Update - ${job.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
            <h1>Application Update</h1>
          </div>
          <div style="padding: 20px;">
            <h2>${job.title}</h2>
            <p><strong>Company:</strong> ${job.companyName}</p>
            <p><strong>Status:</strong> ${application.status.toUpperCase()}</p>
            <p>${statusMessages[application.status] || 'Your application status has been updated.'}</p>
          </div>
        </div>
      `,
    });
  }

  // New application notification for employer
  async sendNewApplicationNotification(employer, application, seeker, job) {
    return await this.sendEmail({
      to: employer.email,
      subject: `New Application: ${job.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>New Application Received!</h1>
          </div>
          <div style="padding: 20px;">
            <h2>${seeker.fullName} applied for ${job.title}</h2>
            <p><strong>Position:</strong> ${job.title}</p>
            <p><strong>Applicant:</strong> ${seeker.fullName}</p>
            <p><strong>Email:</strong> ${seeker.email}</p>
            <p><strong>Phone:</strong> ${seeker.phoneNumber}</p>
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/applications/${application.id}" 
               style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review Application
            </a>
          </div>
        </div>
      `,
    });
  }
}

module.exports = new EmailService();
