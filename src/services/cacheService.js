const logger = require('../utils/logger');

// Simple in-memory cache for development (replace with Redis in production)
class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 300; // 5 minutes in seconds
  }

  async get(key) {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }

      // Check if expired
      if (item.expiry && item.expiry < Date.now()) {
        this.cache.delete(key);
        return null;
      }

      return item.value;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      const item = {
        value,
        expiry: ttl ? Date.now() + (ttl * 1000) : null,
      };

      this.cache.set(key, item);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      return this.cache.delete(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async clear() {
    try {
      this.cache.clear();
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  // Cache middleware for Express routes
  middleware(ttl = this.defaultTTL) {
    return async (req, res, next) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl}:${req.user?.id || 'anonymous'}`;

      try {
        const cachedResponse = await this.get(key);

        if (cachedResponse) {
          res.setHeader('X-Cache', 'HIT');
          return res.json(cachedResponse);
        }

        // Store original res.json to intercept response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
          // Cache the response
          this.set(key, body, ttl);
          res.setHeader('X-Cache', 'MISS');
          return originalJson(body);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // Generate cache key
  generateKey(...parts) {
    return parts.join(':');
  }
}

module.exports = new CacheService();
