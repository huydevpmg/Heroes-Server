import UserConversationService from '../services/userConversation.service.js';

class UserConversationController {
  constructor() {
    this.userConversationService = new UserConversationService();
  }

  updateUserConversation = async (req, res) => {
    try {
      const userId = req.user.id;
      const { userConversationId } = req.params;
      const updateData = req.body;
      const userConversation = await this.userConversationService.updateUserConversation(
        userConversationId,
        userId,
        updateData,
      );
      if (!userConversation) {
        return res.status(404).json({ message: 'User conversation not found' });
      }
      return res.status(200).json(userConversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  togglePin = async (req, res) => {
    try {
      const userId = req.user.id;
      const { userConversationId } = req.params;
      const result = await this.userConversationService.togglePin(userConversationId, userId);
      if (!result) {
        return res.status(404).json({ message: 'User conversation not found' });
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  toggleArchive = async (req, res) => {
    try {
      const userId = req.user.id;
      const { userConversationId } = req.params;
      const result = await this.userConversationService.toggleArchive(userConversationId, userId);
      if (!result) {
        return res.status(404).json({ message: 'User conversation not found' });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  addLabel = async (req, res) => {
    try {
      const userId = req.user.id;
      const { userConversationId } = req.params;
      const { label } = req.body;
      const result = await this.userConversationService.addLabel(userConversationId, userId, label);
      if (!result) {
        return res.status(404).json({ message: 'User conversation not found' });
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  removeLabel = async (req, res) => {
    try {
      const userId = req.user.id;
      const { userConversationId } = req.params;
      const { label } = req.body;
      const result = await this.userConversationService.removeLabel(userConversationId, userId, label);
      if (!result) {
        return res.status(404).json({ message: 'User conversation not found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default UserConversationController;