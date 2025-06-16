import Attachment from '../models/attachment.model.js';
import { emitToRoom } from '../lib/socket.js';

class AttachmentService {
  async createAttachment(attachmentData) {
    const attachment = new Attachment(attachmentData);
    await attachment.save();

    if (attachmentData.conversationId) {
      // Emit socket event for new attachment
      emitToRoom(attachmentData.conversationId, 'new_attachment', attachment);
    }

    return attachment;
  }

  async getAttachments(conversationId) {
    return Attachment.find({ conversationId }).sort({ createdAt: -1 });
  }

  async getAttachmentById(id) {
    return Attachment.findById(id);
  }

  async deleteAttachment(id) {
    const attachment = await Attachment.findByIdAndDelete(id);
    
    if (attachment && attachment.conversationId) {
      // Emit socket event for deleted attachment
      emitToRoom(attachment.conversationId, 'attachment_deleted', {
        attachmentId: id,
      });
    }

    return attachment;
  }

  async getAttachmentsByType(conversationId, type) {
    return Attachment.find({ conversationId, type }).sort({ createdAt: -1 });
  }

  async getAttachmentsByUser(userId) {
    return Attachment.find({ uploadedBy: userId }).sort({ createdAt: -1 });
  }
}

export default AttachmentService; 