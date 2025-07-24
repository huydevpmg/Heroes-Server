import Attachment from '../models/attachment.model.js';
import { uploadFileToGCS } from '../lib/gsc.js';
import Conversation from '../models/conversation.model.js';
import { publish } from '../lib/redis/redis.js';
import { REDIS_CHANNEL } from '../common/enum/redis/redis.enum.js';

class AttachmentService {
  async createAttachment({ file, uploadedBy, conversationId, fileName }) {
    if (!file || !conversationId || !uploadedBy) {
      throw new Error('Missing file, conversationId hoặc uploadedBy');
    }
    const destFileName = `${conversationId}/${file.originalname}`;
    const fileUrl = await uploadFileToGCS(file.path, destFileName);

    const attachmentName = fileName || file.originalname;

    const attachment = new Attachment({
      name: attachmentName,
      url: fileUrl,
      type: file.mimetype,
      size: file.size,
      uploadedBy,
      conversationId,
    });
    await attachment.save();

    if (conversationId) {
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $push: { attachments: attachment._id } },
        { new: true }
      );
    }

    await publish(REDIS_CHANNEL.ATTACHMENT_CREATED, {
      attachment,
    });


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