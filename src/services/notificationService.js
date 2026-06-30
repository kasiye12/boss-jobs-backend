const emailService = require('./emailService');

class NotificationService {
  // Notify job seeker about application status change
  static async notifyApplicationStatusChange(application) {
    try {
      const { sequelize } = require('../config/database');
      const User = require('../models/User');
      const Job = require('../models/Job');

      const [seeker, job, employer] = await Promise.all([
        User.findByPk(application.seekerId),
        Job.findByPk(application.jobId),
        User.findByPk(application.job?.employerId),
      ]);

      if (seeker && job) {
        await emailService.sendApplicationStatusEmail(application, seeker, job);
      }

      return { success: true };
    } catch (error) {
      console.error('Notification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Notify employer about new application
  static async notifyNewApplication(application) {
    try {
      const User = require('../models/User');
      const Job = require('../models/Job');

      const [seeker, job] = await Promise.all([
        User.findByPk(application.seekerId),
        Job.findByPk(application.jobId),
      ]);

      if (job && seeker) {
        const employer = await User.findByPk(job.employerId);
        if (employer) {
          await emailService.sendNewApplicationNotification(employer, application, seeker, job);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Notification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Notify user about welcome
  static async sendWelcomeNotification(user) {
    try {
      await emailService.sendWelcomeEmail(user);
      return { success: true };
    } catch (error) {
      console.error('Welcome notification error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = NotificationService;
