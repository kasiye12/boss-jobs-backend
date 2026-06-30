const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id',
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
  },
  logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  coverImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'cover_image',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  industry: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  companySize: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'company_size',
  },
  foundedYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'founded_year',
  },
  headquarters: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  locations: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
  },
  socialLinks: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
    field: 'social_links',
  },
  benefits: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: true,
  },
  averageRating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    field: 'average_rating',
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'review_count',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified',
  },
}, {
  tableName: 'companies',
  timestamps: true,
  underscored: true,
});

module.exports = Company;
