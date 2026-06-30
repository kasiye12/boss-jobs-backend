const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SavedJob = sequelize.define('SavedJob', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'job_id',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  savedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'saved_at',
  },
}, {
  tableName: 'saved_jobs',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'job_id'],
      unique: true,
    },
  ],
});

module.exports = SavedJob;
