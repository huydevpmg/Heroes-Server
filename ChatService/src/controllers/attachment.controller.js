import AttachmentService from '../services/attachment.service.js';
import fs from 'fs/promises';

class AttachmentController {
  constructor() {
    this.attachmentService = new AttachmentService();
  }

  createAttachments = async (req, res) => {
    try {
      const { conversationId, uploadedBy } = req.body;
      const files = req.files;
      if (!files?.length || !conversationId || !uploadedBy) {
        return res.status(400).json({ message: 'Missing files, conversationId hoặc uploadedBy' });
      }
  
      const attachments = await this.attachmentService.createMultipleAttachments({
        files,
        conversationId,
        uploadedBy
      });

      await Promise.all(
        files.map(async (file) => {
          if (file.path) {
            try {
              await fs.unlink(file.path);
            } catch (err) {
              console.error('Error deleting uploaded file:', file.path, err.message);
            }
          }
        })
      );

      return res.status(201).json(attachments);
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