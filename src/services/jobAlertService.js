const { Op } = require('sequelize');

class JobAlertService {
  // Create job alert
  static async createAlert(userId, criteria) {
    const { sequelize } = require('../config/database');
    
    const [result] = await sequelize.query(`
      INSERT INTO job_alerts (user_id, keywords, job_types, locations, salary_min, frequency, is_active)
      VALUES (:userId, :keywords, :jobTypes, :locations, :salaryMin, :frequency, true)
      RETURNING *
    `, {
      replacements: {
        userId,
        keywords: criteria.keywords || [],
        jobTypes: criteria.jobTypes || [],
        locations: criteria.locations || [],
        salaryMin: criteria.salaryMin || null,
        frequency: criteria.frequency || 'daily',
      },
    });

    return result[0];
  }

  // Get matching jobs for alert
  static async getMatchingJobs(alert) {
    const Job = require('../models/Job');
    
    const where = {
      isActive: true,
      createdAt: {
        [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    };

    if (alert.keywords && alert.keywords.length > 0) {
      where[Op.or] = alert.keywords.map(keyword => ({
        [Op.or]: [
          { title: { [Op.iLike]: `%${keyword}%` } },
          { description: { [Op.iLike]: `%${keyword}%` } },
          { requiredSkills: { [Op.overlap]: [keyword] } },
        ],
      }));
    }

    if (alert.jobTypes && alert.jobTypes.length > 0) {
      where.jobType = { [Op.in]: alert.jobTypes };
    }

    return await Job.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
  }

  // Send job alert email
  static async sendAlertEmail(user, alert, jobs) {
    if (jobs.length === 0) return;

    const emailService = require('./emailService');
    
    const jobListHtml = jobs.map(job => `
      <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
        <h3 style="margin: 0; color: #0066cc;">${job.title}</h3>
        <p style="margin: 5px 0; color: #666;">
          <strong>${job.companyName}</strong> - ${job.jobType}
        </p>
        <p style="margin: 5px 0; color: #888;">${job.salaryRange || 'Negotiable'}</p>
        <a href="${process.env.APP_URL}/jobs/${job.id}" 
           style="color: #0066cc; text-decoration: none;">View Details →</a>
      </div>
    `).join('');

    return await emailService.sendEmail({
      to: user.email,
      subject: `🔔 ${jobs.length} New Jobs Match Your Alert - Boss Jobs Ethiopia`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
            <h1>Job Alert</h1>
            <p>We found ${jobs.length} new jobs matching your criteria</p>
          </div>
          <div style="padding: 20px;">
            ${jobListHtml}
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.APP_URL}/jobs" 
                 style="background: #0066cc; color: white; padding: 12px 25px; 
                        text-decoration: none; border-radius: 5px;">
                View All Matching Jobs
              </a>
            </div>
          </div>
        </div>
      `,
    });
  }
}

module.exports = JobAlertService;
