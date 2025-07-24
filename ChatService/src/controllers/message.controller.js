import MessageService from '../services/message.service.js';
import { emitToRoom } from '../lib/socket/index.js';
import { MessageDeleteType } from '../common/enum/message/message-delete-type.enum.js';
import { EVENTS } from '../common/enum/socket/socket.enum.js';

class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  createMessage = async (req, res) => {
    try {
      const { conversationId, senderId, content, parentMessage, heroContext, attachmentId } = req.body;
      const message = await this.messageService.createMessage({
        conversationId,
        senderId,
        content,
        parentMessage,
        heroContext,
        attachmentId,
      });
      // emitToRoom(conversationId.toString(), EVENTS.RECEIVE_MESSAGE, message);
      return res.status(201).json(message);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getMessages = async (req, res) => {
    try {
      const { conversationId } = req.query;
      const currentUserId = req.user.id;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const result = await this.messageService.getMessages(conversationId, currentUserId, page, limit);
      return res.status(200).json(result);
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

      // emitToRoom(message.conversationId.toString(), EVENTS.MESSAGE_UPDATED, message);
      
      return res.status(200).json(message);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  deleteMessage = async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;
      const { deleteType } = req.body;
  
      const validTypes = Object.values(MessageDeleteType);
      if (!deleteType || !validTypes.includes(deleteType)) {
        return res.status(400).json({ message: `Invalid delete type. Must be one of: ${validTypes.join(', ')}` });
      }
  
      let message;
      let affectedReplies = [];
  
      if (deleteType === MessageDeleteType.EVERYONE) {
        console.log('Deleting message for everyone');
        const result = await this.messageService.deleteMessageForEveryone(messageId);
        message = result?.message;
        affectedReplies = result?.affectedReplies || [];
      } else {
        if (!userId) {
          return res.status(400).json({ message: 'User ID is required for personal delete' });
        }
  
        message = await this.messageService.deleteMessageForUser(messageId, userId);
      }
  
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
  
      return res.status(200).json({
        message: 'Message deleted successfully',
        data: message,
        affectedReplies
      });
  
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default MessageController;