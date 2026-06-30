const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
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
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_revoked',
  },
  deviceInfo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'device_info',
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address',
  },
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  underscored: true,
});

module.exports = RefreshToken;
