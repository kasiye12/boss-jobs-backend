const Company = require('../models/Company');
const CompanyReview = require('../models/CompanyReview');
const Job = require('../models/Job');
const User = require('../models/User');
const { Op } = require('sequelize');

class CompanyController {
  // Create or update company profile
  static async createOrUpdateCompany(req, res) {
    try {
      const [company, created] = await Company.findOrCreate({
        where: { userId: req.user.id },
        defaults: { ...req.body, userId: req.user.id },
      });

      if (!created) {
        await company.update(req.body);
      }

      return res.status(created ? 201 : 200).json({
        success: true,
        message: created ? 'Company created' : 'Company updated',
        data: company,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all companies with pagination
  static async getAllCompanies(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const { count, rows: companies } = await Company.findAndCountAll({
        where: { isVerified: true },
        limit,
        offset,
        order: [['averageRating', 'DESC']],
        include: [
          {
            model: Job,
            as: 'jobs',
            where: { isActive: true },
            required: false,
            attributes: ['id', 'title'],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        data: {
          companies,
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

  // Get company by ID
  static async getCompanyById(req, res) {
    try {
      const company = await Company.findByPk(req.params.id, {
        include: [
          {
            model: CompanyReview,
            as: 'reviews',
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'reviewer', attributes: ['fullName'] }],
          },
        ],
      });

      if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }

      // Get active jobs count
      const activeJobsCount = await Job.count({
        where: { employerId: company.userId, isActive: true },
      });

      return res.status(200).json({
        success: true,
        data: { ...company.toJSON(), activeJobsCount },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Add company review
  static async addReview(req, res) {
    try {
      const company = await Company.findByPk(req.params.id);
      if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }

      // Check if user already reviewed
      const existingReview = await CompanyReview.findOne({
        where: { companyId: req.params.id, userId: req.user.id },
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this company',
        });
      }

      const review = await CompanyReview.create({
        ...req.body,
        companyId: req.params.id,
        userId: req.user.id,
      });

      // Update company average rating
      const allReviews = await CompanyReview.findAll({
        where: { companyId: req.params.id },
        attributes: ['rating'],
      });

      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await company.update({
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      });

      return res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: review,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get company reviews
  static async getCompanyReviews(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: reviews } = await CompanyReview.findAndCountAll({
        where: { companyId: req.params.id, isApproved: true },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'reviewer', attributes: ['fullName', 'profilePictureUrl'] }],
      });

      return res.status(200).json({
        success: true,
        data: {
          reviews,
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

  // Search companies
  static async searchCompanies(req, res) {
    try {
      const { q, industry, size } = req.query;
      const where = { isVerified: true };

      if (q) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { industry: { [Op.iLike]: `%${q}%` } },
        ];
      }

      if (industry) where.industry = industry;
      if (size) where.companySize = size;

      const companies = await Company.findAll({
        where,
        limit: 50,
        order: [['averageRating', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        count: companies.length,
        data: companies,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = CompanyController;
