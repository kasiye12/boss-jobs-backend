const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const JobController = require('../controllers/jobController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create job validation
const createJobValidation = [
  body('title').trim().notEmpty().isLength({ min: 5, max: 150 }),
  body('description').trim().notEmpty().isLength({ min: 20 }),
  body('companyName').trim().notEmpty(),
  body('jobType').optional().isIn(['Full-time', 'Part-time', 'Remote', 'Contract', 'Freelance', 'Internship']),
  body('salaryRange').optional(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('requiredSkills').optional().isArray(),
  body('assessmentQuestions').optional().isArray(),
];

// Public routes
router.get('/', JobController.getAllJobs);
router.get('/search', JobController.searchJobs);
router.get('/nearby', JobController.getNearbyJobs);
router.get('/:id', JobController.getJobById);

// Protected routes
router.use(authMiddleware.authenticate);

// Employer routes
router.post('/', authMiddleware.authorize('employer', 'admin'), createJobValidation, JobController.createJob);
router.put('/:id', authMiddleware.authorize('employer', 'admin'), JobController.updateJob);
router.delete('/:id', authMiddleware.authorize('employer', 'admin'), JobController.deleteJob);
router.get('/employer/myjobs', authMiddleware.authorize('employer'), JobController.getEmployerJobs);

module.exports = router;
