const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CompanyReview = sequelize.define('CompanyReview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'company_id',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pros: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cons: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  employmentStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'employment_status',
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_anonymous',
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_approved',
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'helpful_count',
  },
}, {
  tableName: 'company_reviews',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'company_id'],
      unique: true,
    },
  ],
});

module.exports = CompanyReview;
