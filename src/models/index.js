const { sequelize } = require('../config/database');
const User = require('./User');
const JobSeekerProfile = require('./JobSeekerProfile');
const Job = require('./Job');
const Application = require('./Application');

// Define all model associations
const setupAssociations = () => {
  // User - JobSeekerProfile (One-to-One)
  User.hasOne(JobSeekerProfile, {
    foreignKey: 'userId',
    as: 'profile',
    onDelete: 'CASCADE',
  });
  JobSeekerProfile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // User (Employer) - Job (One-to-Many)
  User.hasMany(Job, {
    foreignKey: 'employerId',
    as: 'jobs',
    onDelete: 'CASCADE',
  });
  Job.belongsTo(User, {
    foreignKey: 'employerId',
    as: 'employer',
  });

  // Job - Application (One-to-Many)
  Job.hasMany(Application, {
    foreignKey: 'jobId',
    as: 'applications',
    onDelete: 'CASCADE',
  });
  Application.belongsTo(Job, {
    foreignKey: 'jobId',
    as: 'job',
  });

  // User (Job Seeker) - Application (One-to-Many)
  User.hasMany(Application, {
    foreignKey: 'seekerId',
    as: 'applications',
    onDelete: 'CASCADE',
  });
  Application.belongsTo(User, {
    foreignKey: 'seekerId',
    as: 'seeker',
  });
};

// Database synchronization with proper ordering
const syncDatabase = async (force = false) => {
  try {
    // Set up associations before syncing
    setupAssociations();

    // Sync in correct order to respect foreign keys
    if (force) {
      await sequelize.query('DROP TABLE IF EXISTS applications CASCADE');
      await sequelize.query('DROP TABLE IF EXISTS jobs CASCADE');
      await sequelize.query('DROP TABLE IF EXISTS job_seeker_profiles CASCADE');
      await sequelize.query('DROP TABLE IF EXISTS users CASCADE');
      
      // Drop ENUM types
      await sequelize.query('DROP TYPE IF EXISTS user_role CASCADE');
      await sequelize.query('DROP TYPE IF EXISTS app_status CASCADE');
    }

    // Sync all models
    await sequelize.sync({ force, alter: !force });
    
    console.log('✅ Database synchronized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  JobSeekerProfile,
  Job,
  Application,
  syncDatabase,
  setupAssociations,
};
