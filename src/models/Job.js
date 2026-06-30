const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'employer_id',
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  companyName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'company_name',
  },
  jobType: {
    type: DataTypes.STRING(50),
    defaultValue: 'Full-time',
    field: 'job_type',
  },
  salaryRange: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'salary_range',
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
    field: 'assessment_questions',
  },
  requiredSkills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: true,
    field: 'required_skills',
  },
  requiredExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'required_experience',
  },
  educationLevel: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'education_level',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'application_deadline',
  },
  vacanciesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'vacancies_count',
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_count',
  },
  applicationsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'applications_count',
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at',
  },
}, {
  tableName: 'jobs',
  timestamps: true,
  underscored: true,
});

Job.prototype.incrementViews = async function() {
  this.viewsCount += 1;
  return await this.save();
};

module.exports = Job;
