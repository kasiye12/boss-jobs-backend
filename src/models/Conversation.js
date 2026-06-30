const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  participant1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'participant_1_id',
  },
  participant2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'participant_2_id',
  },
  lastMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'last_message',
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_message_at',
  },
  unreadCount1: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'unread_count_1',
  },
  unreadCount2: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'unread_count_2',
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'job_id',
  },
}, {
  tableName: 'conversations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['participant_1_id', 'participant_2_id'],
      unique: true,
    },
  ],
});

module.exports = Conversation;
