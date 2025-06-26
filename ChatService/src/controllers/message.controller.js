import MessageService from '../services/message.service.js';
import { emitToRoom } from '../lib/socket.js';

class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  createMessage = async (req, res) => {
    try {
      console.log('Creating message with data:', req.body);
      const { conversationId, senderId, content, parentMessage, heroContext, attachmentId } = req.body;
      const message = await this.messageService.createMessage({
        conversationId,
        senderId,
        content,
        parentMessage,
        heroContext,
        attachmentId,
      });
      return res.status(201).json(message);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getMessages = async (req, res) => {
    try {
      const { conversationId } = req.query;
      const messages = await this.messageService.getMessages(conversationId);
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateMessageStatus = async (req, res) => {
    try {
      const { messageId } = req.params;
      const { status } = req.body;
      const message = await this.messageService.updateMessageStatus(messageId, status);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      emitToRoom(message.conversationId, 'message_status_updated', {
        messageId,
        status,
      });

      return res.status(200).json(message);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateMessage = async (req, res) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Content is required' });
      }
      
      const message = await this.messageService.updateMessage(messageId, content.trim());
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      emitToRoom(message.conversationId, 'message_updated', message);
      
      return res.status(200).json(message);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  deleteMessage = async (req, res) => {
    try {
      const { messageId } = req.params;
      console.log(req.user.id);
      const userId  = req.user.id;
      console.log('User ID:', userId);
      const { deleteType } = req.body;
      
      if (!deleteType || !['everyone', 'justme'].includes(deleteType)) {
        return res.status(400).json({ message: 'Invalid delete type. Must be "everyone" or "justme"' });
      }
      
      let message;
      if (deleteType === 'everyone') {
        message = await this.messageService.deleteMessageForEveryone(messageId);
        
        // Emit socket event for global delete
        if (message) {
          emitToRoom(message.conversationId, 'message_deleted_global', {
            message,
            conversationId: message.conversationId
          });
        }
      } else {
        if (!userId) {
          return res.status(400).json({ message: 'User ID is required for personal delete' });
        }
        message = await this.messageService.deleteMessageForUser(messageId, userId);
        
        if (message) {
          emitToRoom(message.conversationId, 'message_deleted_personal', {
            messageId,
            userId,
            conversationId: message.conversationId
          });
        }
      }
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      return res.status(200).json({ 
        message: 'Message deleted successfully',
        data: message
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  addReaction = async (req, res) => {
    try {
      const { messageId } = req.params;
      const { userId, emoji } = req.body;
      const message = await this.messageService.addReaction(messageId, userId, emoji);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      emitToRoom(message.conversationId, 'message_reaction_added', {
        messageId,
        reaction: { userId, emoji },
      });

      return res.status(200).json(message);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  removeReaction = async (req, res) => {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;
      const message = await this.messageService.removeReaction(messageId, userId);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Emit socket event after successful reaction removal
      emitToRoom(message.conversationId, 'message_reaction_removed', {
        messageId,
        userId,
      });

      return res.status(200).json(message);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default MessageController;