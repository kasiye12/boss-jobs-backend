const AuthService = require('../services/authService');
const User = require('../models/User');

const authMiddleware = {
  authenticate: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account deactivated' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  },

  authorize: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }
      next();
    };
  },
};

module.exports = authMiddleware;
