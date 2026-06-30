const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobCategory = sequelize.define('JobCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  jobCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'job_count',
  },
}, {
  tableName: 'job_categories',
  timestamps: true,
  underscored: true,
});

module.exports = JobCategory;
