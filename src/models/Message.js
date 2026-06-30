const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'conversation_id',
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sender_id',
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'receiver_id',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  messageType: {
    type: DataTypes.STRING(20),
    defaultValue: 'text',
    field: 'message_type',
  },
  attachmentUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'attachment_url',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read',
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at',
  },
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true,
});

module.exports = Message;
