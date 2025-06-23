import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import UserConversation from '../models/userConversation.model.js';
import { emitToRoom } from '../lib/socket.js';
import axios from 'axios';

class MessageService {
  constructor() {
    this.authServiceUrl = 'http://localhost:4000/api';
    this.heroServiceUrl = 'http://localhost:5000/api';
  }

  async createMessage(messageData) {
    try {
      if (!messageData.conversationId || !messageData.senderId || !messageData.content) {
        throw new Error('Missing required fields');
      }

      const message = new Message({
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
        content: messageData.content,
        parentMessage: messageData.parentMessage,
        heroContext: messageData.heroContext || [],
        attachments: messageData.attachments || [],
        status: 'SENT'
      });

      // Save message to DB
      const savedMessage = await message.save();

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(
        messageData.conversationId,
        { lastMessage: savedMessage._id },
        { new: true }
      );

      await UserConversation.updateMany(
        {
          conversationId: messageData.conversationId,
          userId: { $ne: messageData.senderId }
        },
        {
          $set: { lastReadMessage: savedMessage._id }
        }
      );

      return savedMessage;
    } catch (error) {
      throw error;
    }
  }

  async getMessages(conversationId, currentUserId) {
    let messages = await Message.find({
      conversationId,
      isDeleteGlobal: false,
      deletedForUserIds: { $ne: currentUserId },
    })
      .sort({ createdAt: 1 })
      .lean();

    // Extract unique sender IDs, parent message IDs, hero IDs, and reaction user IDs
    const senderIds = [...new Set(messages.map((m) => m.senderId?.toString()))];
    const parentMessageIds = messages.filter((m) => m.parentMessage)
      .map((m) => m.parentMessage?.toString());
    const heroIds = messages.flatMap((m) => m.heroContext || []).map((id) => id.toString());
    const reactionUserIds = [
      ...new Set(messages.flatMap((m) => (m.reactions || []).map((r) => r.userId?.toString()))),
    ];

    const allUserIds = [...new Set([...senderIds, ...reactionUserIds])];
    let users = {};

    if (allUserIds.length) {
      await Promise.all(
      allUserIds.map(async (userId) => {
        try {
        const { data } = await axios.get(`${this.authServiceUrl}/profile/${userId}`);
        if (data && data.user) {
          users[userId] = data.user;
        }
        } catch (err) {
        users[userId] = null;
        }
      })
      );
    }

    let parentMessages = {};
    if (parentMessageIds.length) {
      const parents = await Message.find({ _id: { $in: parentMessageIds } }).lean();
      parents.forEach((pm) => (parentMessages[pm._id] = pm));
    }

    let heroes = {};
    if (heroIds.length) {
      await Promise.all(
      heroIds.map(async (heroId) => {
        try {
        const { data } = await axios.get(`${this.heroServiceUrl}/heroes/${heroId}`);
        if (data && data.hero) {
          heroes[heroId] = data.hero;
        }
        } catch (err) {
        heroes[heroId] = null;
        }
      })
      );
    }

    const result = messages.map((msg) => ({
      ...msg,
      sender: users[msg.senderId?.toString()] || null,
      parentMessage: msg.parentMessage
        ? parentMessages[msg.parentMessage?.toString()] || null
        : null,
      heroContext: (msg.heroContext || []).map((id) => heroes[id.toString()] || null).filter(Boolean),
      reactions: (msg.reactions || []).map((r) => ({
        ...r,
        user: users[r.userId?.toString()] || null,
      })),
    }));

    return result;
  }

  async updateMessageStatus(messageId, status) {
    const message = await Message.findByIdAndUpdate(messageId, { status }, { new: true });

    if (message) {
      emitToRoom(message.conversationId, 'message_status_updated', {
        messageId,
        status,
      });
    }

    return message;
  }

  async deleteMessageGlobally(messageId) {
    return Message.updateOne({ _id: messageId }, { $set: { isDeleteGlobal: true } });
  }

  async deleteMessagePersonally(messageId, userId) {
    return Message.updateOne(
      { _id: messageId },
      { $addToSet: { deletedForUserIds: userId } }
    );
  }

  async addReaction(messageId, userId, emoji) {
    const message = await Message.findById(messageId);
    if (!message) return null;

    const existingReaction = message.reactions.find((r) => r.userId.toString() === userId);
    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();
    emitToRoom(message.conversationId, 'message_reaction_added', {
      messageId,
      reaction: { userId, emoji },
    });

    return message;
  }

  async removeReaction(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) return null;

    message.reactions = message.reactions.filter((r) => r.userId.toString() !== userId);
    await message.save();

    emitToRoom(message.conversationId, 'message_reaction_removed', {
      messageId,
      userId,
    });

    return message;
  }
}

export default MessageService;