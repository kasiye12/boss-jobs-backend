const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobSeekerProfile = sequelize.define('JobSeekerProfile', {
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
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  voicePitchUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'voice_pitch_url',
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: true,
  },
  experienceJson: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
    field: 'experience_json',
  },
  educationJson: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
    field: 'education_json',
  },
  latitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  preferredJobTypes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['Full-time'],
    allowNull: true,
    field: 'preferred_job_types',
  },
  expectedSalaryRange: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'expected_salary_range',
  },
  availabilityStatus: {
    type: DataTypes.STRING(20),
    defaultValue: 'immediate',
    field: 'availability_status',
  },
  profilePictureUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'profile_picture_url',
  },
  resumeUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'resume_url',
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'years_of_experience',
  },
  isProfileComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_profile_complete',
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public',
  },
}, {
  tableName: 'job_seeker_profiles',
  timestamps: true,
  underscored: true,
});

module.exports = JobSeekerProfile;
