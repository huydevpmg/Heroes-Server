import UserConversationService from '../services/userConversation.service.js';
import { emitToRoom } from '../lib/socket/index.js';
import { EVENTS } from '../lib/socket/events.enum.js';

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

  markAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
      const { userConversationId } = req.params;
      const { messageId } = req.body;
      const result = await this.userConversationService.markAsRead(
        userConversationId,
        userId,
        messageId,
      );
      if (!result) {
        return res.status(404).json({ message: 'User conversation not found' });
      }

      // Emit socket event after successful mark as read
      emitToRoom(result.conversationId, EVENTS.MARK_AS_READ, {
        userConversationId,
        messageId,
        userId,
        lastReadAt: result.lastReadAt
      });

      return res.status(200).json(result);
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

      // Emit socket event after successful pin toggle
      emitToRoom(result.conversationId, EVENTS.PIN_CONVERSATION, {
        userConversationId,
        isPinned: result.isPinned,
        userId
      });

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

      // Emit socket event after successful archive toggle
      emitToRoom(result.conversationId, EVENTS.ARCHIVE_CONVERSATION, {
        userConversationId,
        isArchived: result.isArchived,
        userId
      });

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

      // Emit socket event after successful label addition
      emitToRoom(result.conversationId, EVENTS.ADD_LABEL, {
        userConversationId,
        label,
        userId
      });

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

      // Emit socket event after successful label removal
      emitToRoom(result.conversationId, EVENTS.REMOVE_LABEL, {
        userConversationId,
        label,
        userId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default UserConversationController;