import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import UserConversation from "../models/userConversation.model.js";
import axios from "axios";
import Attachment from "../models/attachment.model.js";
import FormData from "form-data";
import fs from "fs";
import AttachmentService from "./attachment.service.js";

class MessageService {
  constructor() {
    this.authServiceUrl = "http://localhost:4000/api";
    this.heroServiceUrl = "http://localhost:5000/api";
    this.attachmentService = new AttachmentService();
  }

  async createMessage(messageData) {
    try {
      // Create new message
      const message = new Message({
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
        content: messageData.content,
        parentMessage: messageData.parentMessage || undefined,
        heroContext: messageData.heroContext || undefined,
        attachmentId: messageData.attachmentId || undefined,
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
  
      // Update UserConversation: set lastReadMessage + updatedAt
      await UserConversation.updateMany(
        { conversationId: messageData.conversationId },
        {
          $set: {
            updatedAt: new Date(),
            lastReadMessage: savedMessage._id,
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
      const sender = await this.getUserProfile(messageData.senderId);
  
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
              const { data } = await axios.get(`${this.authServiceUrl}/profile/${parentSenderId}`);
              parentSender = data;
            } catch (err) {
              parentSender = null; // fallback in case of error
            }
          }
  
          parentMessageWithSender = {
            ...parent,
            sender: parentSender,
          };
        }
      }
  
      // Return message with sender and parent info (if any)
      return {
        ...savedMessage.toObject(),
        sender,
        parentMessage: parentMessageWithSender,
      };
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
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments(query)
    ]);

    const senderIds = [...new Set(messages.map((m) => m.senderId?.toString()))];
    const parentMessageIds = messages
      .filter((m) => m.parentMessage)
      .map((m) => m.parentMessage?.toString());
    const heroIds = messages
      .flatMap((m) => m.heroContext || [])
      .map((id) => id.toString());
    const reactionUserIds = [
      ...new Set(
        messages.flatMap((m) =>
          (m.reactions || []).map((r) => r.userId?.toString())
        )
      ),
    ];

    const allUserIds = [...new Set([...senderIds, ...reactionUserIds])];
    let users = {};

    if (allUserIds.length) {
      await Promise.all(
        allUserIds.map(async (userId) => {
          try {
            const { data } = await axios.get(
              `${this.authServiceUrl}/profile/${userId}`
            );
            if (data) {
              users[userId] = data;
            }
          } catch (err) {
            users[userId] = null;
          }
        })
      );
    }

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
        await Promise.all(
          parentSenderIds.map(async (userId) => {
            if (!users[userId]) { // Only fetch if not already fetched
              try {
                const { data } = await axios.get(
                  `${this.authServiceUrl}/profile/${userId}`
                );
                if (data) {
                  users[userId] = data;
                  parentSenders[userId] = data;
                }
              } catch (err) {
                users[userId] = null;
                parentSenders[userId] = null;
              }
            } else {
              parentSenders[userId] = users[userId];
            }
          })
        );
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
      reactions: (msg.reactions || []).map((r) => ({
        ...r,
        user: users[r.userId?.toString()] || null,
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

  async updateMessageStatus(messageId, status) {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );
    return message;
  }

  async deleteMessageGlobally(messageId) {
    return Message.updateOne(
      { _id: messageId },
      { $set: { isDeleteGlobal: true } }
    );
  }

  async deleteMessagePersonally(messageId, userId) {
    return Message.updateOne(
      { _id: messageId },
      { $addToSet: { deletedForUserIds: userId } }
    );
  }

  async addReaction(messageId, userId, emoji) {
    const message = await Message.findById(messageId);
    if (!message) {
      return null;
    }

    const existingReaction = message.reactions.find(
      (r) => r.userId.toString() === userId
    );
    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();
    return message;
  }

  async removeReaction(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      return null;
    }

    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== userId
    );
    await message.save();
    return message;
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
      return message;
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

        console.log("Previous message:", previousMessage);
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
    try {
      const { data } = await axios.get(`${this.authServiceUrl}/profile/${userId}`);
      return data;
    } catch (error) {
      console.error(`Failed to get profile for user ${userId}:`, error.message);
      return null;
    }
  }
}

export default MessageService;
