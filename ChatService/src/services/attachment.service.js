import Attachment from '../models/attachment.model.js';
import { uploadFileToGCS } from '../lib/gsc.js';
import Conversation from '../models/conversation.model.js';

class AttachmentService {
  async createMultipleAttachments({ files, uploadedBy, conversationId }) {
    if (!files || !files.length) {
      throw new Error('No files provided');
    }
  
    const uploadedInfos = await Promise.all(
      files.map(async (file) => {
        const destFileName = `${conversationId}/${file.originalname}`;
        const url = await uploadFileToGCS(file.path, destFileName);
        return {
          name: file.originalname,
          url,
          type: file.mimetype,
          size: file.size,
          uploadedBy,
          conversationId,
        };
      })
    );
    return uploadedInfos;
  }

  async getAttachments(conversationId) {
    return Attachment.find({ conversationId }).sort({ createdAt: -1 });
  }

  async getAttachmentById(id) {
    return Attachment.findById(id);
  }

  async deleteAttachment(id) {
    const attachment = await Attachment.findByIdAndDelete(id);
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