const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/jobs`, jobRoutes);
app.use(`${API_PREFIX}/applications`, applicationRoutes);
app.use(`${API_PREFIX}/profile`, profileRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

// API Documentation
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    name: 'Boss Jobs Ethiopia API',
    version: '2.0.0',
    endpoints: {
      auth: { register: 'POST /api/v1/auth/register', login: 'POST /api/v1/auth/login' },
      jobs: { list: 'GET /api/v1/jobs', nearby: 'GET /api/v1/jobs/nearby', search: 'GET /api/v1/jobs/search' },
      applications: { apply: 'POST /api/v1/applications/apply/:jobId', list: 'GET /api/v1/applications/my-applications' },
      profile: { get: 'GET /api/v1/profile', create: 'POST /api/v1/profile' },
      dashboard: { seeker: 'GET /api/v1/dashboard/seeker', employer: 'GET /api/v1/dashboard/employer', admin: 'GET /api/v1/dashboard/platform' },
    },
    testAccounts: {
      admin: 'admin@bossjobs.et / Admin123!@#',
      employer: 'hr@ethiotech.com / Employer123!@#',
      seeker: 'abebe@email.com / Seeker123!@#',
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', tip: 'Visit /api/v1 for docs' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: err.message });
});

// Start
const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`\n🚀 Boss Jobs Ethiopia API running on http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/v1`);
      console.log(`🏠 Dashboard: http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('Failed to start:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
