const { sequelize } = require('../config/database');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const { Op } = require('sequelize');

class DashboardController {
  // Get overall platform statistics
  static async getPlatformStats(req, res) {
    try {
      const [
        totalUsers,
        totalJobs,
        totalApplications,
        activeJobs,
        totalEmployers,
        totalSeekers,
      ] = await Promise.all([
        User.count(),
        Job.count(),
        Application.count(),
        Job.count({ where: { isActive: true } }),
        User.count({ where: { role: 'employer' } }),
        User.count({ where: { role: 'job_seeker' } }),
      ]);

      // Get recent activity
      const recentJobs = await Job.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'title', 'companyName', 'jobType', 'createdAt'],
      });

      const recentApplications = await Application.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          {
            model: Job,
            as: 'job',
            attributes: ['title', 'companyName'],
          },
          {
            model: User,
            as: 'seeker',
            attributes: ['fullName'],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        data: {
          statistics: {
            totalUsers,
            totalEmployers,
            totalSeekers,
            totalJobs,
            activeJobs,
            totalApplications,
          },
          recentJobs,
          recentApplications,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching dashboard statistics',
        error: error.message,
      });
    }
  }

  // Get employer-specific dashboard
  static async getEmployerDashboard(req, res) {
    try {
      const employerId = req.user.id;

      const [
        myJobs,
        activeJobs,
        totalApplications,
        shortlistedCandidates,
      ] = await Promise.all([
        Job.count({ where: { employerId } }),
        Job.count({ where: { employerId, isActive: true } }),
        Application.count({
          include: [
            {
              model: Job,
              as: 'job',
              where: { employerId },
            },
          ],
        }),
        Application.count({
          include: [
            {
              model: Job,
              as: 'job',
              where: { employerId },
            },
          ],
          where: { status: 'shortlisted' },
        }),
      ]);

      const recentApplications = await Application.findAll({
        include: [
          {
            model: Job,
            as: 'job',
            where: { employerId },
            attributes: ['title'],
          },
          {
            model: User,
            as: 'seeker',
            attributes: ['fullName', 'email', 'phoneNumber'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
      });

      return res.status(200).json({
        success: true,
        data: {
          statistics: {
            totalJobsPosted: myJobs,
            activeJobs,
            totalApplications,
            shortlistedCandidates,
          },
          recentApplications,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching employer dashboard',
        error: error.message,
      });
    }
  }

  // Get job seeker dashboard
  static async getSeekerDashboard(req, res) {
    try {
      const seekerId = req.user.id;

      const [
        myApplications,
        pendingApplications,
        shortlistedApplications,
        profileCompleteness,
      ] = await Promise.all([
        Application.count({ where: { seekerId } }),
        Application.count({ where: { seekerId, status: 'pending' } }),
        Application.count({ where: { seekerId, status: 'shortlisted' } }),
        JobSeekerProfile.findOne({
          where: { userId: seekerId },
          attributes: ['isProfileComplete', 'title', 'skills'],
        }),
      ]);

      // Get recommended jobs based on profile
      let recommendedJobs = [];
      if (profileCompleteness && profileCompleteness.skills && profileCompleteness.skills.length > 0) {
        recommendedJobs = await Job.findAll({
          where: {
            isActive: true,
            requiredSkills: {
              [Op.overlap]: profileCompleteness.skills,
            },
          },
          order: [['createdAt', 'DESC']],
          limit: 5,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          statistics: {
            totalApplications: myApplications,
            pendingApplications,
            shortlistedApplications,
            profileComplete: profileCompleteness?.isProfileComplete || false,
          },
          profile: profileCompleteness,
          recommendedJobs,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching seeker dashboard',
        error: error.message,
      });
    }
  }
}

module.exports = DashboardController;
