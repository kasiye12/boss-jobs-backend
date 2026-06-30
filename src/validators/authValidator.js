const { body } = require('express-validator');

const authValidators = {
  register: [
    body('fullName')
      .trim()
      .notEmpty().withMessage('Full name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name contains invalid characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    
    body('phoneNumber')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^\+?251[0-9]{9}$/).withMessage('Please provide a valid Ethiopian phone number (e.g., +2519XXXXXXXX)'),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('confirmPassword')
      .notEmpty().withMessage('Please confirm your password')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    
    body('role')
      .optional()
      .isIn(['job_seeker', 'employer']).withMessage('Role must be either job_seeker or employer'),
  ],

  login: [
    body('emailOrPhone')
      .trim()
      .notEmpty().withMessage('Email or phone number is required'),
    
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],

  telegramAuth: [
    body('initData')
      .trim()
      .notEmpty().withMessage('Telegram initData is required')
      .isString().withMessage('initData must be a string'),
  ],
};

module.exports = authValidators;
