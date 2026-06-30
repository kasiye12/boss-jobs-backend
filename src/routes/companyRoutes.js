const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', CompanyController.getAllCompanies);
router.get('/search', CompanyController.searchCompanies);
router.get('/:id', CompanyController.getCompanyById);
router.get('/:id/reviews', CompanyController.getCompanyReviews);

// Protected routes
router.use(authMiddleware.authenticate);
router.post('/', authMiddleware.authorize('employer', 'admin'), CompanyController.createOrUpdateCompany);
router.post('/:id/reviews', CompanyController.addReview);

module.exports = router;
