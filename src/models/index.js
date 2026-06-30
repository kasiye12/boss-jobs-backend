const { sequelize } = require('../config/database');
const User = require('./User');
const JobSeekerProfile = require('./JobSeekerProfile');
const Job = require('./Job');
const Application = require('./Application');

// Set up associations
User.hasOne(JobSeekerProfile, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
JobSeekerProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Job, { foreignKey: 'employerId', as: 'jobs', onDelete: 'CASCADE' });
Job.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });

Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

User.hasMany(Application, { foreignKey: 'seekerId', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(User, { foreignKey: 'seekerId', as: 'seeker' });

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('✅ Database synchronized');
    return true;
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    throw error;
  }
};

module.exports = { sequelize, User, JobSeekerProfile, Job, Application, syncDatabase };
