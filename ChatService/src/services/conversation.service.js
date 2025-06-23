import axios from "axios";
import Conversation from "../models/conversation.model.js";
import UserConversation from "../models/userConversation.model.js";
import Message from "../models/message.model.js";
import { emitToRoom } from "../lib/socket.js";

class ConversationService {
  constructor() {
    this.authServiceUrl = "http://localhost:4000/api";
    this.heroServiceUrl = "http://localhost:5000/api";
  }

  async createConversation(conversationData) {
    const conversation = new Conversation(conversationData);
    await conversation.save();

    const userConversationPromises = conversationData.participants.map(
      (userId) =>
        UserConversation.create({
          conversationId: conversation._id,
          userId,
        })
    );
    await Promise.all(userConversationPromises);

    conversationData.participants.forEach((userId) => {
      emitToRoom(userId, "new_conversation", conversation);
    });

    return conversation;
  }

  async getConversations(userId) {
    const userConversations = await UserConversation.find({ userId })
      .populate("conversationId")
      .sort({ updatedAt: -1 });

    return Promise.all(
      userConversations.map(async (uc) => {
        const conversation = uc.conversationId;
        const enriched = await this.enrichConversationData(
          conversation,
          userId
        );

        return {
          _id: conversation._id,
          name: enriched.name,
          avatar: enriched.avatar,
          lastMessage: enriched.lastMessage,
          updatedAt: conversation.updatedAt,
          isPinned: uc.isPinned,
          isArchived: uc.isArchived,
          labels: uc.labels,
          lastReadAt: uc.lastReadAt,
          participants: conversation.participants,
          isGroup: conversation.isGroup,
        };
      })
    );
  }

  async enrichConversationData(conversation, currentUserId) {
    const participants = await Promise.all(
      conversation.participants.map((id) => this.getUserData(id))
    );

    const lastMessage = conversation.lastMessage
      ? await this.getMessageById(conversation.lastMessage)
      : null;

    let otherParticipant = null;
    if (!conversation.isGroup) {
      otherParticipant = participants.find(
        (p) => p && p._id !== currentUserId.toString()
      );
    }

    return {
      participants,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId,
          }
        : null,
      name: conversation.isGroup
        ? conversation.name || "Nhóm mới"
        : otherParticipant?.fullName || "Người dùng ẩn danh",
      avatar: conversation.isGroup
        ? conversation.groupAvatar || "default-group.png"
        : otherParticipant?.avatar || "default-avatar.png",
    };
  }

  async getUserData(userId) {
    try {
      const response = await axios.get(
        `${this.authServiceUrl}/profile/${userId}`
      );
      const { _id, fullName, username, email, avatar } = response.data;
      return { _id, fullName, username, email, avatar };
    } catch (error) {
      console.error("❌ Error fetching user data:", error.message);
      return null;
    }
  }

  async getHeroData(heroId) {
    try {
      const response = await axios.get(
        `${this.heroServiceUrl}/heroes/${heroId}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching hero data:", error.message);
      return null;
    }
  }

  async getConversationById(id) {
    return Conversation.findById(id);
  }

  async getMessageById(messageId) {
    return Message.findById(messageId);
  }

  async findOrCreate1on1Conversation(userId1, userId2) {
    const existingConversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [userId1, userId2] },
    });

    if (existingConversation) {
      return existingConversation;
    }

    return this.createConversation({
      participants: [userId1, userId2],
      isGroup: false,
      createdBy: userId1,
    });
  }

  async updateConversation(id, updateData) {
    try {
      const conversation = await Conversation.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (!conversation) {
        return null;
      }

      return conversation;
    } catch (error) {
      console.error("Error updating conversation:", error);
      throw new Error("Error updating conversation");
    }
  }

  async getAllUsers() {
    try {
      const response = await axios.get(`${this.authServiceUrl}/profile`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Error fetching users");
    }
  }
}

export default ConversationService;
