import ConversationService from '../services/conversation.service.js';
class ConversationController {
  constructor() {
    this.conversationService = new ConversationService();
  }

  findOrCreateConversation = async (req, res) => {
    try {
      const { name, participants, isGroup, heroContext } = req.body;
      const createdBy = req.user.id;
  
      const conversation = await this.conversationService.findOrCreateConversation({
        name,
        participants,
        isGroup,
        heroContext,
        createdBy,
        attachments: []
      });
      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  

  getConversations = async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const result = await this.conversationService.getConversations(userId, page, limit);
      return res.status(200).json(result);
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

  addMemberToGroup = async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const { memberIds } = req.body;
      const currentUserId = req.user.id;

      // Validate input
      if (!Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({
          message: 'Member IDs array is required and cannot be empty'
        });
      }

      const result = await this.conversationService.addMemberToGroup(
        conversationId,
        memberIds,
        currentUserId
      );

      return res.status(200).json({
        message: 'Members added successfully',
        data: result
      });

    } catch (error) {
      const message = error.message || 'Internal server error';

      if (message.includes('not found')) {
        return res.status(404).json({ message });
      }

      if (
        message.includes('Cannot add members') ||
        message.includes('already members')
      ) {
        return res.status(400).json({ message });
      }

      return res.status(500).json({ message });
    }
  };

  removeMemberFromGroup = async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const { userId } = req.body;
      const currentUserId = req.user.id;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const result = await this.conversationService.removeMemberFromGroup(conversationId, userId, currentUserId);

      return res.status(200).json({
        message: 'Member removed successfully',
        data: result
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('Cannot remove members') || error.message.includes('not a member')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Leave group conversation
   * PATCH /api/conversations/leave/:id
   */
  leaveGroup = async (req, res) => {
    try {
      const { id: userId, fullName } = req.user;
      const { id: conversationId } = req.params;
      await this.conversationService.leaveGroup(conversationId, userId);

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Clear conversation for a user
   * PATCH /api/conversations/:id/clear
   */
  clearConversation = async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const userId = req.user.id;
      
      const result = await this.conversationService.clearConversation(conversationId, userId);

      return res.status(200).json({
        message: 'Conversation cleared successfully',
        data: result
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('not a participant')) {
        return res.status(403).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  };
}

export default ConversationController;