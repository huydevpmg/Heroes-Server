import AttachmentService from '../services/attachment.service.js';
import { emitToRoom } from '../lib/socket/index.js';
import { EVENTS } from '../common/enum/socket.enum.js';

class AttachmentController {
  constructor() {
    this.attachmentService = new AttachmentService();
  }

  createAttachment = async (req, res) => {
    try {
      const { conversationId, uploadedBy, fileName } = req.body;
      const file = req.file;
      if (!file || !conversationId || !uploadedBy) {
        return res.status(400).json({ message: 'Missing file, conversationId hoặc uploadedBy' });
      }
      const attachment = await this.attachmentService.createAttachment({ file, conversationId, uploadedBy, fileName });
      
      // Emit socket event after successful attachment creation
      emitToRoom(conversationId, EVENTS.ATTACHMENT_CREATED, {
        attachment,
        conversationId
      });
      
      return res.status(201).json(attachment);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getAttachments = async (req, res) => {
    try {
      const { conversationId } = req.query;
      const attachments = await this.attachmentService.getAttachments(conversationId);
      return res.status(200).json(attachments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getAttachmentById = async (req, res) => {
    try {
      const { id } = req.params;
      const attachment = await this.attachmentService.getAttachmentById(id);
      if (!attachment) {
        return res.status(404).json({ message: 'Attachment not found' });
      }
      return res.status(200).json(attachment);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  deleteAttachment = async (req, res) => {
    try {
      const { id } = req.params;
      const attachment = await this.attachmentService.deleteAttachment(id);
      if (!attachment) {
        return res.status(404).json({ message: 'Attachment not found' });
      }

      // Emit socket event after successful deletion
      if (attachment.conversationId) {
        emitToRoom(attachment.conversationId, EVENTS.ATTACHMENT_DELETED, {
          attachmentId: id,
        });
      }

      return res.status(200).json({ message: 'Attachment deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getAttachmentsByType = async (req, res) => {
    try {
      const { conversationId, type } = req.query;
      const attachments = await this.attachmentService.getAttachmentsByType(conversationId, type);
      return res.status(200).json(attachments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getAttachmentsByUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const attachments = await this.attachmentService.getAttachmentsByUser(userId);
      return res.status(200).json(attachments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default AttachmentController;