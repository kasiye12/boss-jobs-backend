const { body } = require('express-validator');

const jobValidators = {
  createJob: [
    body('title')
      .trim()
      .notEmpty().withMessage('Job title is required')
      .isLength({ min: 5, max: 150 }).withMessage('Title must be between 5 and 150 characters'),
    
    body('description')
      .trim()
      .notEmpty().withMessage('Job description is required')
      .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
    
    body('companyName')
      .trim()
      .notEmpty().withMessage('Company name is required')
      .isLength({ max: 100 }).withMessage('Company name must not exceed 100 characters'),
    
    body('jobType')
      .optional()
      .isIn(['Full-time', 'Part-time', 'Remote', 'Contract', 'Freelance', 'Internship', 'Temporary'])
      .withMessage('Invalid job type'),
    
    body('salaryRange')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Salary range must not exceed 50 characters'),
    
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude value'),
    
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude value'),
    
    body('requiredSkills')
      .optional()
      .isArray().withMessage('Skills must be an array'),
    
    body('requiredSkills.*')
      .optional()
      .isString().withMessage('Each skill must be a string')
      .trim()
      .notEmpty().withMessage('Skill cannot be empty'),
    
    body('assessmentQuestions')
      .optional()
      .isArray().withMessage('Assessment questions must be an array'),
    
    body('applicationDeadline')
      .optional()
      .isISO8601().withMessage('Invalid deadline date format')
      .custom(value => {
        if (new Date(value) < new Date()) {
          throw new Error('Deadline must be in the future');
        }
        return true;
      }),
  ],
};

module.exports = jobValidators;
