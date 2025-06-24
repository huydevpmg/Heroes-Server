import Attachment from '../models/attachment.model.js';
import { emitToRoom } from '../lib/socket.js';
import { uploadFileToGCS } from '../lib/gsc.js';
import Conversation from '../models/conversation.model.js';

class AttachmentService {
  async createAttachment({ file, uploadedBy, conversationId }) {
    if (!file || !conversationId || !uploadedBy) {
      throw new Error('Missing file, conversationId hoặc uploadedBy');
    }
    const destFileName = `${conversationId}/${file.originalname}`;
    const fileUrl = await uploadFileToGCS(file.path, destFileName);

    const attachment = new Attachment({
      name: file.originalname,
      url: fileUrl,
      type: file.mimetype,
      size: file.size,
      uploadedBy,
      conversationId,
    });
    await attachment.save();

    if (conversationId) {
      // Push attachment._id vào conversation.attachments
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $push: { attachments: attachment._id } },
        { new: true }
      );
      emitToRoom(conversationId, 'new_attachment', attachment);
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