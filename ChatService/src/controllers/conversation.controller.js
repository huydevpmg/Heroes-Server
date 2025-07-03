import ConversationService from '../services/conversation.service.js';
import { emitToRoom } from '../lib/socket/index.js';
import { EVENTS } from '../common/enum/socket.enum.js';

class ConversationController {
  constructor() {
    this.conversationService = new ConversationService();
  }

  createConversation = async (req, res) => {
    try {
      const { name, participants, isGroup, heroContext, createdBy } = req.body;
      const conversation = await this.conversationService.createConversation({
        name,
        participants,
        isGroup,
        heroContext,
        createdBy,
        attachments: [],
      });

      // Emit socket event for group creation
      if (isGroup) {
        emitToRoom(conversation._id, EVENTS.GROUP_CREATED, {
          _id: conversation._id,
          name: conversation.name,
          participants: conversation.participants,
          isGroup: conversation.isGroup,
          createdBy: conversation.createdBy,
          createdAt: conversation.createdAt
        });
      }

      return res.status(201).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getConversations = async (req, res) => {
    try {
      const userId  = req.user.id;
      const conversations = await this.conversationService.getConversations(userId);
      return res.status(200).json(conversations);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getConversationById = async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await this.conversationService.getConversationById(id);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  findOrCreate1on1Conversation = async (req, res) => {
    try {
      const userId1 = req.user.id;
      const { participantId } = req.body;
      const conversation = await this.conversationService.findOrCreate1on1Conversation(
        userId1,
        participantId,
      );
      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateConversation = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const conversation = await this.conversationService.updateConversation(id, updateData);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getAllUsers = async(req, res) => {
    try {
      const users = await this.conversationService.getAllUsers();
      return res.status(200).json(users);
    } 
    catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  updateLastAttachmentName = async (req, res) => {
    const { id } = req.params;
    const { lastAttachmentName } = req.body;
    try {
      const conversation = await this.conversationService.updateLastAttachmentName(id, lastAttachmentName);
      res.json(conversation);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Leave group conversation
   * PATCH /api/conversations/leave/:id
   */
  leaveGroup = async (req, res) => {
    try {
      const { id: userId, fullName } = req.user;
      const { id: conversationId } = req.params;
      await this.conversationService.leaveGroup(conversationId, userId);

      emitToRoom(conversationId, EVENTS.RECEIVE_MESSAGE, {
        conversationId,
        type: 'SYSTEM',
        systemType: 'USER_LEAVE',
        meta: { userId, fullName: fullName },
      });
      emitToRoom(conversationId, EVENTS.LEAVE_GROUP_NOTIFY, { userId, conversationId });
      emitToUser(userId, EVENTS.LEAVE_GROUP, { userId, conversationId });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default ConversationController;