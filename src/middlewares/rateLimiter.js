const rateLimit = require('express-rate-limit');

const rateLimiters = {
  // General API limiter
  globalLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Auth endpoints limiter (more strict)
  authLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again after 15 minutes.',
    },
    skipSuccessfulRequests: true,
  }),

  // Job creation limiter for employers
  jobCreationLimiter: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each employer to 20 job postings per hour
    message: {
      success: false,
      message: 'You have reached the job posting limit. Please try again later.',
    },
    keyGenerator: (req) => req.user?.id || req.ip, // Rate limit by user ID
  }),

  // Application submission limiter
  applicationLimiter: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Limit job seekers to 30 applications per hour
    message: {
      success: false,
      message: 'You have reached the application limit. Please try again later.',
    },
    keyGenerator: (req) => req.user?.id || req.ip,
  }),
};

module.exports = rateLimiters;
