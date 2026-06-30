const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

class SavedJobController {
  // Save a job
  static async saveJob(req, res) {
    try {
      const { jobId } = req.params;
      const { notes } = req.body;

      // Check if job exists
      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      const [savedJob, created] = await SavedJob.findOrCreate({
        where: { userId: req.user.id, jobId },
        defaults: { userId: req.user.id, jobId, notes },
      });

      if (!created) {
        return res.status(400).json({
          success: false,
          message: 'Job already saved',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Job saved successfully',
        data: savedJob,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get saved jobs
  static async getSavedJobs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const { count, rows: savedJobs } = await SavedJob.findAndCountAll({
        where: { userId: req.user.id },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Job,
            as: 'job',
            where: { isActive: true },
            required: true,
          },
        ],
      });

      return res.status(200).json({
        success: true,
        data: {
          savedJobs,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
          },
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Remove saved job
  static async removeSavedJob(req, res) {
    try {
      const { jobId } = req.params;

      const result = await SavedJob.destroy({
        where: { userId: req.user.id, jobId },
      });

      if (result === 0) {
        return res.status(404).json({
          success: false,
          message: 'Saved job not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Job removed from saved',
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Check if job is saved
  static async checkSavedJob(req, res) {
    try {
      const { jobId } = req.params;

      const savedJob = await SavedJob.findOne({
        where: { userId: req.user.id, jobId },
      });

      return res.status(200).json({
        success: true,
        data: { isSaved: !!savedJob },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = SavedJobController;
