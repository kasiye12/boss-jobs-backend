const Job = require('../models/Job');
const GeoService = require('../services/geoService');
const { Op } = require('sequelize');

class JobController {
  // Get all jobs with pagination
  static async getAllJobs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const { count, rows: jobs } = await Job.findAndCountAll({
        where: { isActive: true },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: {
          jobs,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: limit,
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching jobs',
        error: error.message,
      });
    }
  }

  // Get nearby jobs based on coordinates
  static async getNearbyJobs(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required',
        });
      }

      const result = await GeoService.findJobsInRadius(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching nearby jobs',
        error: error.message,
      });
    }
  }

  // Search jobs
  static async searchJobs(req, res) {
    try {
      const { q, type, location, skills } = req.query;

      const where = { isActive: true };

      if (q) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { companyName: { [Op.iLike]: `%${q}%` } },
        ];
      }

      if (type) {
        where.jobType = type;
      }

      if (skills) {
        const skillsArray = skills.split(',');
        where.requiredSkills = {
          [Op.overlap]: skillsArray,
        };
      }

      const jobs = await Job.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 50,
      });

      return res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error searching jobs',
        error: error.message,
      });
    }
  }

  // Get job by ID
  static async getJobById(req, res) {
    try {
      const job = await Job.findByPk(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
        });
      }

      // Increment view count
      await job.incrementViews();

      return res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching job',
        error: error.message,
      });
    }
  }

  // Create job
  static async createJob(req, res) {
    try {
      const jobData = {
        ...req.body,
        employerId: req.user.id,
      };

      const job = await Job.create(jobData);

      return res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error creating job',
        error: error.message,
      });
    }
  }

  // Update job
  static async updateJob(req, res) {
    try {
      const job = await Job.findOne({
        where: {
          id: req.params.id,
          employerId: req.user.id,
        },
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or unauthorized',
        });
      }

      await job.update(req.body);

      return res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: job,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error updating job',
        error: error.message,
      });
    }
  }

  // Delete job
  static async deleteJob(req, res) {
    try {
      const job = await Job.findOne({
        where: {
          id: req.params.id,
          employerId: req.user.id,
        },
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or unauthorized',
        });
      }

      await job.destroy();

      return res.status(200).json({
        success: true,
        message: 'Job deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting job',
        error: error.message,
      });
    }
  }

  // Get employer's jobs
  static async getEmployerJobs(req, res) {
    try {
      const jobs = await Job.findAll({
        where: { employerId: req.user.id },
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching your jobs',
        error: error.message,
      });
    }
  }
}

module.exports = JobController;
