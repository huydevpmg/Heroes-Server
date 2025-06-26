import ConversationService from '../services/conversation.service.js';
import { emitToRoom } from '../lib/socket.js';

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
        emitToRoom(conversation._id, 'group_created', {
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
}

export default ConversationController;