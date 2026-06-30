const AuthService = require('../services/authService');
const User = require('../models/User');

const authMiddleware = {
  // Authenticate user
  authenticate: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.',
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token);

      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found or token invalid.',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        error: error.message,
      });
    }
  },

  // Role-based authorization
  authorize: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action.',
        });
      }

      next();
    };
  },

  // Optional authentication (doesn't require token but attaches user if valid)
  optionalAuth: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = AuthService.verifyToken(token);
        const user = await User.findByPk(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
        }
      }
    } catch (error) {
      // Continue without user
    }
    
    next();
  },
};

module.exports = authMiddleware;
