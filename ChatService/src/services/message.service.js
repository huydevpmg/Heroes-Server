import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
// import Attachment from "../models/attachment.model";
export const sendMessageService = async ({ conversationId, senderId, content, attachments = [] }) => {

  if (!conversationId || !senderId || !content) {
    throw new Error('Invalid data: conversationId, senderId, and content are required');
  }

  // if (!Array.isArray(attachments)) {
  //   throw new Error('Attachments must be an array');
  // }

  // if (attachments.length > 0) {
  //   const existCount = await Attachment.countDocuments({ _id: { $in: attachments } });
  //   if (existCount !== attachments.length) {
  //     throw new Error('Invalid attachment(s)');
  //   }
  // }

  const message = await Message.create({
    conversationId,
    senderId,
    content,
    attachments: []
  });
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: content,
    lastUpdateAt: new Date(),
  });
  return message;
};

export const getMessagesService = async (conversationId, limit = 20, skip = 0) => {
  return Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};