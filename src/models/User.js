const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name',
  },
  email: {
    type: DataTypes.STRING(150),
    unique: true,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    field: 'phone_number',
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash',
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'job_seeker',
    allowNull: false,
    validate: {
      isIn: [['job_seeker', 'employer', 'admin']],
    },
  },
  telegramId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
    field: 'telegram_id',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at',
  },
  profileCompletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'profile_completed_at',
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash')) {
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    },
  },
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.passwordHash;
  return values;
};

module.exports = User;
