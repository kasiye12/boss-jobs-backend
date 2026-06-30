const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'job_id',
  },
  seekerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'seeker_id',
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    allowNull: false,
    validate: {
      isIn: [['pending', 'reviewed', 'shortlisted', 'rejected', 'withdrawn']],
    },
  },
  quizScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'quiz_score',
  },
  quizAnswers: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
    field: 'quiz_answers',
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cover_letter',
  },
  employerNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'employer_notes',
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'applied_at',
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at',
  },
}, {
  tableName: 'applications',
  timestamps: true,
  underscored: true,
});

module.exports = Application;
