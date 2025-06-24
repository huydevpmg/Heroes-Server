import MessageService from '../services/message.service.js';

class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  createMessage = async (req, res) => {
    try {
      const { conversationId, senderId, content, parentMessage, heroContext, attachments } = req.body;
      // console.log('Creating message:', {
      //   conversationId,
      //   senderId,    
      //   content,
      //   parentMessage,
      //   heroContext,
      //   attachments,
      // });co

      const message = await this.messageService.createMessage({
        conversationId,
        senderId,
        content,
        parentMessage,
        heroContext,
        attachments,
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
      return res.status(200).json(message);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  deleteMessage = async (req, res) => {
    try {
      const { messageId } = req.params;
      const { type } = req.query; 
      
      if (type === 'global') {
        await this.messageService.deleteMessageGlobally(messageId);
      } else if (type === 'personal') {
        const userId = req.user.id;  // Or get from req.body if needed
        await this.messageService.deleteMessagePersonally(messageId, userId);
      } else {
        return res.status(400).json({ message: 'Invalid delete type' });
      }
      
      return res.status(200).json({ message: 'Message deleted successfully' });
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
      return res.status(200).json(message);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default MessageController;