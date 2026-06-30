const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

class ApplicationController {
  // Apply for job
  static async applyForJob(req, res) {
    try {
      const { jobId } = req.params;
      const { coverLetter, quizAnswers } = req.body;

      const job = await Job.findOne({
        where: { id: jobId, isActive: true },
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or inactive',
        });
      }

      const existingApplication = await Application.findOne({
        where: { jobId, seekerId: req.user.id },
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this job',
        });
      }

      // Calculate quiz score
      let quizScore = 0;
      if (job.assessmentQuestions && job.assessmentQuestions.length > 0 && quizAnswers) {
        quizScore = calculateQuizScore(job.assessmentQuestions, quizAnswers);
      }

      const application = await Application.create({
        jobId,
        seekerId: req.user.id,
        coverLetter,
        quizAnswers,
        quizScore,
      });

      // Increment application count
      await job.increment('applicationsCount');

      // Send notification to employer
      NotificationService.notifyNewApplication(application).catch(err => 
        console.error('Notification failed:', err.message)
      );

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully!',
        data: application,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error submitting application',
        error: error.message,
      });
    }
  }

  // Get user's applications
  static async getMyApplications(req, res) {
    try {
      const applications = await Application.findAll({
        where: { seekerId: req.user.id },
        include: [
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'companyName', 'jobType', 'salaryRange', 'latitude', 'longitude'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        count: applications.length,
        data: applications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching applications',
        error: error.message,
      });
    }
  }

  // Get applications for a job (employer view)
  static async getJobApplications(req, res) {
    try {
      const { jobId } = req.params;

      const job = await Job.findOne({
        where: { id: jobId, employerId: req.user.id },
      });

      if (!job && req.user.role !== 'admin') {
        return res.status(404).json({
          success: false,
          message: 'Job not found or unauthorized',
        });
      }

      const applications = await Application.findAll({
        where: { jobId },
        include: [
          {
            model: User,
            as: 'seeker',
            attributes: ['id', 'fullName', 'email', 'phoneNumber'],
            include: [{
              model: require('../models/JobSeekerProfile'),
              as: 'profile',
              attributes: ['title', 'skills', 'yearsOfExperience'],
            }],
          },
        ],
        order: [
          ['quizScore', 'DESC'],
          ['createdAt', 'DESC'],
        ],
      });

      return res.status(200).json({
        success: true,
        count: applications.length,
        data: applications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching applications',
        error: error.message,
      });
    }
  }

  // Update application status (employer)
  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, employerNotes } = req.body;

      const application = await Application.findByPk(id, {
        include: [{ model: Job, as: 'job' }],
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      if (application.job.employerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const oldStatus = application.status;
      application.status = status;
      if (employerNotes) application.employerNotes = employerNotes;
      if (status === 'reviewed') application.reviewedAt = new Date();
      await application.save();

      // Send notification if status changed
      if (oldStatus !== status) {
        NotificationService.notifyApplicationStatusChange(application).catch(err =>
          console.error('Notification failed:', err.message)
        );
      }

      return res.status(200).json({
        success: true,
        message: `Application ${status} successfully`,
        data: application,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error updating application',
        error: error.message,
      });
    }
  }

  // Withdraw application
  static async withdrawApplication(req, res) {
    try {
      const { id } = req.params;

      const application = await Application.findOne({
        where: { id, seekerId: req.user.id },
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      application.status = 'withdrawn';
      await application.save();

      return res.status(200).json({
        success: true,
        message: 'Application withdrawn successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error withdrawing application',
        error: error.message,
      });
    }
  }

  // Get application statistics
  static async getApplicationStats(req, res) {
    try {
      const stats = await Application.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        ],
        group: ['status'],
      });

      const totalApplications = await Application.count();
      const todayApplications = await Application.count({
        where: {
          createdAt: {
            [require('sequelize').Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          total: totalApplications,
          today: todayApplications,
          byStatus: stats,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message,
      });
    }
  }
}

function calculateQuizScore(questions, answers) {
  let score = 0;
  questions.forEach((question, index) => {
    if (answers[index] === question.correctAnswer) {
      score++;
    }
  });
  return score;
}

module.exports = ApplicationController;
