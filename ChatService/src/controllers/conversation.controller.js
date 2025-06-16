import ConversationService from '../services/conversation.service.js';

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
      });
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
      const { partnerId } = req.body;
      const conversation = await this.conversationService.findOrCreate1on1Conversation(
        userId1,
        partnerId,
      );
      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default ConversationController; 