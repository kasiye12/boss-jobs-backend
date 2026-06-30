const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 150],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [20, 5000],
    },
  },
  companyName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  jobType: {
    type: DataTypes.STRING(50),
    defaultValue: 'Full-time',
    validate: {
      isIn: [['Full-time', 'Part-time', 'Remote', 'Contract', 'Freelance', 'Internship', 'Temporary']],
    },
  },
  salaryRange: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  assessmentQuestions: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
    comment: 'Array of multiple-choice questions for screening',
  },
  requiredSkills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: true,
  },
  requiredExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Minimum years of experience required',
  },
  educationLevel: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  vacanciesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  applicationsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'jobs',
  indexes: [
    {
      fields: ['latitude', 'longitude'],
      using: 'gist',
      name: 'idx_jobs_location_gist',
    },
    {
      fields: ['requiredSkills'],
      using: 'gin',
      name: 'idx_jobs_skills_gin',
    },
    {
      fields: ['isActive', 'expiresAt'],
      name: 'idx_jobs_active_expires',
    },
  ],
});

// Associations
Job.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
User.hasMany(Job, { foreignKey: 'employerId', as: 'jobs' });

// Instance methods
Job.prototype.incrementViews = async function() {
  this.viewsCount += 1;
  return await this.save();
};

module.exports = Job;
