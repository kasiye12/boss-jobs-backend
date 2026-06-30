const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const JobSeekerProfile = sequelize.define('JobSeekerProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'e.g., Senior Accountant, Driver',
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 2000],
    },
  },
  voicePitchUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Cloud link to the 30-second introductory audio',
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
    comment: 'Stores nested employment history for offline sync flexibility',
  },
  educationJson: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
    comment: 'Stores educational history',
  },
  latitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
    validate: {
      min: -90,
      max: 90,
    },
  },
  longitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
    validate: {
      min: -180,
      max: 180,
    },
  },
  preferredJobTypes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['Full-time'],
    allowNull: true,
  },
  expectedSalaryRange: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  availabilityStatus: {
    type: DataTypes.ENUM('immediate', 'within_2_weeks', 'within_1_month', 'negotiable'),
    defaultValue: 'immediate',
  },
  profilePictureUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  resumeUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 50,
    },
  },
  isProfileComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'job_seeker_profiles',
  indexes: [
    {
      fields: ['latitude', 'longitude'],
      using: 'gist',
      name: 'idx_seeker_location_gist',
    },
    {
      fields: ['skills'],
      using: 'gin',
      name: 'idx_seeker_skills_gin',
    },
    {
      fields: ['userId'],
      unique: true,
      name: 'idx_seeker_user_unique',
    },
  ],
});

// Associations
JobSeekerProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(JobSeekerProfile, { foreignKey: 'userId', as: 'profile' });

// Instance methods
JobSeekerProfile.prototype.isProfileCompleted = function() {
  return !!(this.title && this.bio && this.skills.length > 0 && this.experienceJson.length > 0);
};

module.exports = JobSeekerProfile;
