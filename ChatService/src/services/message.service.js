import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import UserConversation from "../models/userConversation.model.js";
import axios from "axios";
import AttachmentService from "./attachment.service.js";
import MessageReaction from "../models/reaction.model.js";
import { config } from "../config/index.js";
import userProfileService from "./userProfile.service.js";
import { REDIS_CHANNEL } from "../common/enum/redis/redis.enum.js";
import { publish } from "../lib/redis/redis.js";

class MessageService {
  constructor() {
    this.heroServiceUrl = config.heroServiceUrl || "http://localhost:5000/api";
    this.attachmentService = new AttachmentService();
  }

  async createMessage(messageData) {
    try {
      // Create new message
      const message = new Message({
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
        content: messageData.content,
        parentMessage: messageData.parentMessage || null,
        heroContext: messageData.heroContext || null,
        attachmentId: messageData.attachmentId || null,
        status: "SENT",
      });
  
      const savedMessage = await message.save();
  
      // Update last message + updatedAt for conversation
      await Conversation.findByIdAndUpdate(
        messageData.conversationId,
        {
          lastMessage: savedMessage._id,
          updatedAt: new Date(),
        },
        { new: true }
      );
  
      // Update UserConversation: updatedAt
      await UserConversation.updateMany(
        { conversationId: messageData.conversationId },
        {
          $set: {
            updatedAt: new Date(),
          },
        }
      );
  
      // If some users had isDeleted = true -> reset lại để hiện lại convo
      const conversation = await Conversation.findById(messageData.conversationId).lean();
      if (conversation?.participants?.length) {
        await UserConversation.updateMany(
          {
            conversationId: messageData.conversationId,
            isDeleted: true,
            userId: { $in: conversation.participants },
          },
          {
            $set: { isDeleted: false, updatedAt: new Date() },
          }
        );
      }
  
      // Get sender profile for this message
      const sender = await userProfileService.getUser(messageData.senderId);
  
      // Handle parent message if exists
      let parentMessageWithSender = null;
      if (messageData.parentMessage) {
        // Get parent message info
        const parent = await Message.findById(messageData.parentMessage).lean();
  
        if (parent) {
          const parentSenderId = parent.senderId?.toString();
          let parentSender = null;
  
          // Call API to get sender profile of parent
          if (parentSenderId) {
            try {
              parentSender = await userProfileService.getUser(parentSenderId);
            } catch (err) {
              parentSender = null;
            }
          }
  
          parentMessageWithSender = {
            ...parent,
            sender: parentSender,
          };
        }
      }
  
      // Return message with sender and parent info (if any)
      const result = {
        ...savedMessage.toObject(),
        sender,
        parentMessage: parentMessageWithSender,
      };
      // Publish to Redis
      await publish(REDIS_CHANNEL.CHAT_MESSAGE, { conversationId: messageData.conversationId, message: result });
      return result;
    } catch (error) {
      throw new Error("Error creating message: " + error.message);
    }
  }

  async getMessages(conversationId, currentUserId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const userConversation = await UserConversation.findOne({
      conversationId,
      userId: currentUserId
    });
    const clearAt = userConversation?.clearAt;

    const query = {
      conversationId,
      deletedForUserIds: { $ne: currentUserId },
    };

    if (clearAt) {
      query.createdAt = { $gt: clearAt };
    }

    const [messages, total] = await Promise.all([
      Message.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments(query)
    ]);

    // Lấy reactions cho tất cả message
    const messageIds = messages.map(m => m._id);
    const reactionsArr = await MessageReaction.find({ messageId: { $in: messageIds } }).lean();

    // Gom reactions theo messageId
    const reactionsMap = {};
    for (const r of reactionsArr) {
      if (!reactionsMap[r.messageId]) {reactionsMap[r.messageId] = [];}
      reactionsMap[r.messageId].push(r);
    }

    // Lấy userIds từ reactions
    const reactionUserIds = [
      ...new Set(
        reactionsArr.flatMap(r => r.users.map(uid => uid.toString()))
      ),
    ];

    // Lấy user profile cho tất cả sender và reaction users
    const senderIds = [...new Set(messages.map((m) => m.senderId?.toString()))];
    const allUserIds = [...new Set([...senderIds, ...reactionUserIds])];
    let users = {};
    if (allUserIds.length) {
      const usersArr = await userProfileService.getUsers(allUserIds);
      usersArr.forEach((user) => {
        if (user && user._id) {
          users[user._id] = user;
        }
      });
    }

    const parentMessageIds = messages
      .map(msg => msg.parentMessage)
      .filter(id => !!id);

    let parentMessages = {};
    if (parentMessageIds.length) {
      const parents = await Message.find({
        _id: { $in: parentMessageIds },
      }).lean();
      
      // Get sender IDs for parent messages
      const parentSenderIds = parents.map(p => p.senderId?.toString()).filter(Boolean);
      
      // Fetch parent message senders
      let parentSenders = {};
      if (parentSenderIds.length) {
        const parentSendersArr = await userProfileService.getUsers(parentSenderIds);
        parentSenderIds.forEach((userId, idx) => {
          parentSenders[userId] = parentSendersArr[idx] || null;
          if (!users[userId]) { users[userId] = parentSendersArr[idx] || null; }
        });
      }
      
      // Populate parent messages with sender info
      parents.forEach((pm) => {
        parentMessages[pm._id] = {
          ...pm,
          sender: users[pm.senderId?.toString()] || null
        };
      });
    }

    let heroes = {};
    const heroIds = [
      ...new Set(
        messages.flatMap(msg => (msg.heroContext || []).map(id => id.toString()))
      ),
    ];
    if (heroIds.length) {
      await Promise.all(
        heroIds.map(async (heroId) => {
          try {
            const { data } = await axios.get(
              `${this.heroServiceUrl}/heroes/${heroId}`
            );
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
      heroContext: (msg.heroContext || [])
        .map((id) => heroes[id.toString()] || null)
        .filter(Boolean),
      reactions: (reactionsMap[msg._id] || []).map(r => ({
        emoji: r.emoji,
        users: r.users.map(uid => users[uid.toString()] || null)
      })),
    }));

    const totalPages = Math.ceil(total / limit);
    return {
      messages: result,
      total,
      page,
      totalPages
    };
  }

  async updateMessage(messageId, content) {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { content, updatedAt: new Date(), isEdit: true },
        { new: true }
      );

      if (!message) {
        return null;
      }
      const sender = await userProfileService.getUser(message.senderId);
      let parentMessageWithSender = null;
      if (message.parentMessage) {
        const parent = await Message.findById(message.parentMessage).lean();
        let parentSender = null;
        if (parent && parent.senderId) {
          try {
            parentSender = await userProfileService.getUser(parent.senderId.toString());
          } catch (err) {
            parentSender = null;
          }
        }
        parentMessageWithSender = parent ? { ...parent, sender: parentSender } : null;
      }
      const result = {
        ...message.toObject(),
        sender,
        parentMessage: parentMessageWithSender,
      };
      await publish(REDIS_CHANNEL.MESSAGE_UPDATED, result);
      return result;
    } catch (error) {
      throw new Error("Error updating message: " + error.message);
    }
  }

  async deleteMessageForEveryone(messageId) {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        {
          isDeleteGlobal: true,
          updatedAt: new Date(),
        },
        { new: true }
      );
  
      if (!message) {
        return { message: null, affectedReplies: [] };
      }
  
      const replies = await Message.find({ parentMessage: messageId }).select('_id').lean();
      const affectedReplies = replies.map(reply => reply._id.toString());
      // emitToRoom(message.conversationId.toString(), EVENTS.MESSAGE_DELETED_GLOBAL, {
      //             messageId,
      //             conversationId: message.conversationId.toString(),
      //             affectedReplies
      //           });

      await publish(REDIS_CHANNEL.MESSAGE_DELETED, {
        // messageId,
        // conversationId: message.conversationId.toString(),
        message,
        affectedReplies
      });
      return { message, affectedReplies };
    } catch (error) {
      throw new Error("Error deleting message globally: " + error.message);
    }
  }

  async deleteMessageForUser(messageId, userId) {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        {
          $addToSet: { deletedForUserIds: userId },
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!message) {
        return null;
      }

      await Conversation.findByIdAndUpdate(
        message.conversationId,
        { updatedAt: new Date() },
        { new: true }
      );

      const conversation = await Conversation.findById(message.conversationId);
      if (conversation && conversation.lastMessage && 
          conversation.lastMessage.toString() === messageId) {
        
        const previousMessage = await Message.findOne({
          conversationId: message.conversationId,
          _id: { $ne: messageId },
          isDeleteGlobal: { $ne: true }
        }).sort({ createdAt: -1 });

        await Conversation.findByIdAndUpdate(
          message.conversationId,
          { lastMessage: previousMessage ? previousMessage._id : null },
          { new: true }
        );
      }

      return message;
    } catch (error) {
      throw new Error("Error deleting message for user: " + error.message);
    }
  }

  async getUserProfile(userId) {
    return userProfileService.getUser(userId);
  }
}

export default MessageService;
