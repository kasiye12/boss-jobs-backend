const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Job = require('../models/Job');
const { Op } = require('sequelize');

class MessageController {
  // Get all conversations for user
  static async getConversations(req, res) {
    try {
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { participant1Id: req.user.id },
            { participant2Id: req.user.id },
          ],
        },
        include: [
          {
            model: User,
            as: 'participant1',
            attributes: ['id', 'fullName', 'profilePictureUrl'],
          },
          {
            model: User,
            as: 'participant2',
            attributes: ['id', 'fullName', 'profilePictureUrl'],
          },
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title'],
          },
        ],
        order: [['lastMessageAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get messages for a conversation
  static async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      // Verify user is participant
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation || 
          (conversation.participant1Id !== req.user.id && 
           conversation.participant2Id !== req.user.id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const messages = await Message.findAll({
        where: { conversationId },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'fullName', 'profilePictureUrl'],
          },
        ],
      });

      // Mark messages as read
      await Message.update(
        { isRead: true, readAt: new Date() },
        {
          where: {
            conversationId,
            receiverId: req.user.id,
            isRead: false,
          },
        }
      );

      // Reset unread count
      if (conversation.participant1Id === req.user.id) {
        conversation.unreadCount1 = 0;
      } else {
        conversation.unreadCount2 = 0;
      }
      await conversation.save();

      return res.status(200).json({
        success: true,
        data: messages.reverse(),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Send message
  static async sendMessage(req, res) {
    try {
      const { receiverId, message, jobId } = req.body;

      // Find or create conversation
      const participant1Id = Math.min(req.user.id, receiverId);
      const participant2Id = Math.max(req.user.id, receiverId);

      let [conversation] = await Conversation.findOrCreate({
        where: { participant1Id, participant2Id },
        defaults: {
          participant1Id,
          participant2Id,
          jobId: jobId || null,
          lastMessage: message,
          lastMessageAt: new Date(),
        },
      });

      if (!conversation.createdAt) {
        // Update existing conversation
        conversation.lastMessage = message;
        conversation.lastMessageAt = new Date();
        
        // Increment unread count for receiver
        if (conversation.participant1Id === receiverId) {
          conversation.unreadCount1 += 1;
        } else {
          conversation.unreadCount2 += 1;
        }
        
        await conversation.save();
      }

      // Create message
      const newMessage = await Message.create({
        conversationId: conversation.id,
        senderId: req.user.id,
        receiverId,
        message,
      });

      return res.status(201).json({
        success: true,
        data: newMessage,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get unread count
  static async getUnreadCount(req, res) {
    try {
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { participant1Id: req.user.id },
            { participant2Id: req.user.id },
          ],
        },
      });

      const totalUnread = conversations.reduce((sum, conv) => {
        if (conv.participant1Id === req.user.id) {
          return sum + conv.unreadCount1;
        } else {
          return sum + conv.unreadCount2;
        }
      }, 0);

      return res.status(200).json({
        success: true,
        data: { unreadCount: totalUnread },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = MessageController;
