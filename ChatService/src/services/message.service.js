import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import UserConversation from '../models/userConversation.model.js';
import { emitToRoom } from '../lib/socket.js';
import axios from 'axios';

class MessageService {
  constructor() {
    // Use the same URLs as in ConversationService
    this.authServiceUrl = 'http://localhost:4000/api';
    this.heroServiceUrl = 'http://localhost:5000/api';
  }

  // Create a new message
  async createMessage(messageData) {
    try {
      // Validate required fields
      if (!messageData.conversationId || !messageData.senderId || !messageData.content) {
        throw new Error('Missing required fields');
      }

      // Create message object
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

      // Update user conversations
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

  // Get all messages for a conversation, excluding the current user's deleted messages
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

    // Combine all unique user IDs involved in the messages
    const allUserIds = [...new Set([...senderIds, ...reactionUserIds])];
    let users = {};

    // Fetch user profiles for all involved user IDs
    if (allUserIds.length) {
      // Call the profile API for each userId (since batch API is not available)
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
      // Call API to get hero details by IDs (using GET /heroes/:id for each hero)
      await Promise.all(
      heroIds.map(async (heroId) => {
        try {
        const { data } = await axios.get(`${this.heroServiceUrl}/heroes/${heroId}`);
        if (data && data.hero) {
          heroes[heroId] = data.hero;
        }
        } catch (err) {
        // Handle error or skip hero if not found
        heroes[heroId] = null;
        }
      })
      );
    }

    // Enrich each message with sender data, parent message, hero context, and reactions
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

  // Update the status of a message (e.g., read/unread, delivered, etc.)
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

  // Mark a message as globally deleted
  async deleteMessageGlobally(messageId) {
    return Message.updateOne({ _id: messageId }, { $set: { isDeleteGlobal: true } });
  }

  // Mark a message as deleted for a specific user
  async deleteMessagePersonally(messageId, userId) {
    return Message.updateOne(
      { _id: messageId },
      { $addToSet: { deletedForUserIds: userId } }
    );
  }

  // Add a reaction (emoji) to a message
  async addReaction(messageId, userId, emoji) {
    const message = await Message.findById(messageId);
    if (!message) return null;

    // Check if the user already reacted, if so, update their reaction
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

  // Remove a reaction from a message
  async removeReaction(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) return null;

    // Filter out the user's reaction
    message.reactions = message.reactions.filter((r) => r.userId.toString() !== userId);
    await message.save();

    // Emit socket event to notify all participants
    emitToRoom(message.conversationId, 'message_reaction_removed', {
      messageId,
      userId,
    });

    return message;
  }
}

export default MessageService;