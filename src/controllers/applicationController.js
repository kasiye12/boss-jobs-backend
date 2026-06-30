const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

class ApplicationController {
  // Apply for job
  static async applyForJob(req, res) {
    try {
      const { jobId } = req.params;
      const { coverLetter, quizAnswers } = req.body;

      // Check if job exists and is active
      const job = await Job.findOne({
        where: { id: jobId, isActive: true },
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or inactive',
        });
      }

      // Check if already applied
      const existingApplication = await Application.findOne({
        where: { jobId, seekerId: req.user.id },
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this job',
        });
      }

      // Calculate quiz score if assessment questions exist
      let quizScore = 0;
      if (job.assessmentQuestions && job.assessmentQuestions.length > 0 && quizAnswers) {
        quizScore = calculateQuizScore(job.assessmentQuestions, quizAnswers);
      }

      // Create application
      const application = await Application.create({
        jobId,
        seekerId: req.user.id,
        coverLetter,
        quizAnswers,
        quizScore,
      });

      // Increment application count on job
      await job.increment('applicationsCount');

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
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
            attributes: ['id', 'title', 'companyName', 'jobType', 'salaryRange'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
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

  // Get applications for a job (employer)
  static async getJobApplications(req, res) {
    try {
      const { jobId } = req.params;

      // Verify job belongs to employer
      const job = await Job.findOne({
        where: { id: jobId, employerId: req.user.id },
      });

      if (!job) {
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
          },
        ],
        order: [['quizScore', 'DESC']],
      });

      return res.status(200).json({
        success: true,
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

  // Update application status
  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const application = await Application.findByPk(id, {
        include: [{ model: Job, as: 'job' }],
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      // Verify job belongs to employer
      if (application.job.employerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      application.status = status;
      if (status === 'reviewed') {
        application.reviewedAt = new Date();
      }
      await application.save();

      return res.status(200).json({
        success: true,
        message: 'Application status updated',
        data: application,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error updating application status',
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
}

// Helper function to calculate quiz score
function calculateQuizScore(questions, answers) {
  let score = 0;
  
  questions.forEach((question, index) => {
    if (answers[index] && answers[index] === question.correctAnswer) {
      score++;
    }
  });

  return score;
}

module.exports = ApplicationController;
