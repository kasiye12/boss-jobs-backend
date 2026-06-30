const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Job = require('./Job');
const User = require('./User');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Job,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  seekerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'withdrawn'),
    defaultValue: 'pending',
  },
  quizScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Automated grading result from screening quiz',
  },
  quizAnswers: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 3000],
    },
  },
  employerNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'applications',
  indexes: [
    {
      fields: ['jobId', 'seekerId'],
      unique: true,
      name: 'idx_unique_application',
    },
    {
      fields: ['status'],
      name: 'idx_application_status',
    },
  ],
});

// Associations
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Application.belongsTo(User, { foreignKey: 'seekerId', as: 'seeker' });
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
User.hasMany(Application, { foreignKey: 'seekerId', as: 'applications' });

module.exports = Application;
