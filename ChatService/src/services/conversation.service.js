import axios from "axios";
import Conversation from "../models/conversation.model.js";
import UserConversation from "../models/userConversation.model.js";
import Message from "../models/message.model.js";
import { config } from "../config/index.js";
import userProfileService from "./userProfile.service.js";
import { publish } from "../lib/redis/redis.js";
import { REDIS_CHANNEL } from "../common/enum/redis/redis.enum.js";

class ConversationService {
  constructor() {
    this.heroServiceUrl = config.heroServiceUrl || "http://localhost:5000/api";
  }

  async findOrCreateConversation({ name, participants, isGroup, heroContext, createdBy, attachments = [] }) {
    if (!isGroup && participants.length === 2) {
      const existingConversation = await Conversation.findOne({
        isGroup: false,
        participants: { $all: participants }
      });
  
      if (existingConversation) {
        return existingConversation;
      }
    }
  
    return this.createConversation({
      name,
      participants,
      isGroup,
      heroContext,
      createdBy,
      attachments
    });
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

    if (conversation.isGroup) {
      const user = await userProfileService.getUser(conversation.createdBy);
      const systemMsg = await Message.create({
        conversationId: conversation._id,
        senderId: conversation.createdBy,
        type: "SYSTEM",
        systemType: "GROUP_CREATED",
        content: `${user?.fullName || user?.username || "User"} created the group`,
        meta: {
          userId: conversation.createdBy,
          fullName: user?.fullName || user?.username || "User",
          username: user?.username || "user",
        },
      });
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: systemMsg._id,
      });
    }

    await publish(REDIS_CHANNEL.CONVERSATION_CREATED, conversation);
    return conversation;
  }

  async getConversations(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const userConversationsQuery = UserConversation.find({
      userId,
      isDeleted: { $ne: true },
      $or: [
        { clearAt: { $exists: false } },
        { clearAt: null },
        { $expr: { $gt: ["$updatedAt", "$clearAt"] } }
      ]
    })
      .populate("conversationId")
      .populate("labels")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const [userConversations, total] = await Promise.all([
      userConversationsQuery,
      UserConversation.countDocuments({
        userId,
        isDeleted: { $ne: true },
        $or: [
          { clearAt: { $exists: false } },
          { clearAt: null },
          { $expr: { $gt: ["$updatedAt", "$clearAt"] } }
        ]
      })
    ]);

    const conversations = await Promise.all(
      userConversations.map(async (uc) => {
        const conversation = uc.conversationId;
        const enriched = await this.enrichConversationData(
          conversation,
          userId
        );

        let unreadCount = 0;
        if (uc.lastReadMessage) {
          const lastReadMsg = await Message.findById(uc.lastReadMessage);
          let lastReadTime = lastReadMsg ? lastReadMsg.createdAt : null;
          if (lastReadTime) {
            unreadCount = await Message.countDocuments({
              conversationId: conversation._id,
              createdAt: { $gt: lastReadTime },
              deletedForUserIds: { $ne: userId },
              senderId: { $ne: userId },
            });
          } else {
            unreadCount = 0;
          }
        } else {
          unreadCount = await Message.countDocuments({
            conversationId: conversation._id,
            deletedForUserIds: { $ne: userId },
            senderId: { $ne: userId },
          });
        }

        return {
          _id: conversation._id,
          userConversationId: uc._id,
          name: enriched.name,
          avatar: enriched.avatar,
          lastMessage: enriched.lastMessage,
          updatedAt: conversation.updatedAt,
          isPinned: uc.isPinned,
          isArchived: uc.isArchived,
          isDeleted: uc.isDeleted,
          labels: uc.labels,
          lastReadAt: uc.lastReadAt,
          participants: enriched.participants,
          isGroup: conversation.isGroup,
          createdBy: conversation.createdBy.toString(),
          attachments: conversation.attachments || [],
          labels: uc.labels || [],
          unreadCount,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);
    return {
      conversations: conversations.sort(
        (a, b) =>
          new Date(b.updatedAt || "").getTime() -
          new Date(a.updatedAt || "").getTime()
      ),
      total,
      page,
      totalPages
    };
  }

  async enrichConversationData(conversation, currentUserId) {
    const [participants, userConversation] = await Promise.all([
      Promise.all(conversation.participants.map((id) => userProfileService.getUser(id))),
      UserConversation.findOne({
        conversationId: conversation._id,
        userId: currentUserId,
      }),
    ]);
  
    const clearAt = userConversation?.clearAt;
  
    let lastMessage = null;
    if (clearAt) {
      lastMessage = await Message.findOne({
        conversationId: conversation._id,
        deletedForUserIds: { $ne: currentUserId },
      }).sort({ createdAt: -1 });
    } else if (conversation.lastMessage) {
      const message = await this.getMessageById(conversation.lastMessage);
      if (message && !message.deletedForUserIds?.includes(currentUserId)) {
        lastMessage = message;
      } else {
        lastMessage = await Message.findOne({
          conversationId: conversation._id,
          deletedForUserIds: { $ne: currentUserId },
        }).sort({ createdAt: -1 });
      }
    }
  
    const isGroup = conversation.isGroup;
    const otherParticipant = !isGroup
      ? participants.find((p) => p && p._id.toString() !== currentUserId.toString())
      : null;
  
    const enrichedLastMessage = lastMessage
      ? {
          content:
            lastMessage.type === "ATTACHMENT"
              ? `sent ${lastMessage.attachmentIds?.length || 0} attachments`
              : lastMessage.isDeleteGlobal
              ? "Message was deleted"
              : lastMessage.content,
          type: lastMessage.type,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId,
          isDeleteGlobal: lastMessage.isDeleteGlobal || false,
          senderName: lastMessage.senderId
            ? (
                participants.find(
                  (p) => p && p._id?.toString() === lastMessage.senderId?.toString()
                )?.fullName || "Unknown"
              )
            : undefined,
          attachments: lastMessage.attachmentIds || [],
        }
      : null;
    return {
      participants,
      lastMessage: enrichedLastMessage,
      name: isGroup
        ? conversation.name || "Nhóm mới"
        : otherParticipant?.fullName || "Người dùng ẩn danh",
      avatar: isGroup
        ? conversation.groupAvatar || "default-group.png"
        : otherParticipant?.avatar || "default-avatar.png",
    };
  }

  async getUserData(userId) {
    return userProfileService.getUser(userId);
  }

  async getHeroData(heroId) {
    try {
      const response = await axios.get(
        `${this.heroServiceUrl}/heroes/${heroId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching hero data:", error.message);
      return null;
    }
  }

  async getConversationById(id) {
    return Conversation.findById(id);
  }

  async getMessageById(messageId) {
    return Message.findById(messageId);
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
    return userProfileService.getAllUsers();
  }

  async addMemberToGroup(conversationId, memberIds, currentUserId) {
    try {
      // Check if conversation exists and is a group
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      if (!conversation.isGroup) {
        throw new Error("Cannot add members to non-group conversation");
      }

      // Check if current user is the owner of the group
      if (conversation.createdBy.toString() !== currentUserId.toString()) {
        throw new Error("Only the group owner can add members to the group");
      }

      // Filter out members that are already in the group
      const currentParticipants = conversation.participants.map((id) =>
        id.toString()
      );
      const newMembers = memberIds.filter(
        (id) => !currentParticipants.includes(id.toString())
      );

      if (newMembers.length === 0) {
        throw new Error(
          "All specified users are already members of this group"
        );
      }

      // Update conversation with new participants and timestamp
      const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          $addToSet: { participants: { $each: newMembers } },
          updatedAt: new Date(),
        },
        { new: true }
      );

      // Create UserConversation records for new members
      const userConversationPromises = newMembers.map((userId) =>
        UserConversation.create({
          conversationId: conversationId,
          userId: userId,
        })
      );
      await Promise.all(userConversationPromises);

      // Get user data for new members and create system message
      const newMemberUsers = await Promise.all(
        newMembers.map((userId) => userProfileService.getUser(userId))
      );

      // Get data of the user who performed the action
      const currentUser = await userProfileService.getUser(currentUserId);

      // Create content for multiple users added
      const memberNames = newMemberUsers
        .map((user) => user?.fullName || user?.username || "User")
        .join(", ");

      const actionPerformerName =
        currentUser?.fullName || currentUser?.username || "Someone";

      const systemMsg = await Message.create({
        conversationId,
        senderId: currentUserId,
        type: "SYSTEM",
        systemType: "USER_ADDED",
        content: `${actionPerformerName} added ${memberNames} to the group`,
        meta: {
          actionPerformer: {
            userId: currentUserId,
            fullName:
              currentUser?.fullName || currentUser?.username || "Someone",
            username: currentUser?.username || "user",
          },
          addedUsers: newMemberUsers.map((user) => ({
            userId: user?._id,
            fullName: user?.fullName || user?.username || "User",
            username: user?.username || "user",
          })),
          addedCount: newMembers.length,
        },
      });

      // Update last message and timestamp
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: systemMsg._id,
        updatedAt: new Date(),
      });

      // Publish USER_ADDED event to Redis for all participants
      const payload = {
        conversationId,
        addedMembers: newMembers,
        conversation: updatedConversation,
        systemMessage: systemMsg
      };
      await publish(REDIS_CHANNEL.ADD_MEMBER, payload);

      return {
        conversation: updatedConversation,
        addedMembers: newMembers,
        systemMessage: systemMsg,
      };
    } catch (error) {
      throw new Error("Error adding members to group: " + error.message);
    }
  }

  async removeMemberFromGroup(conversationId, userId, currentUserId) {
    try {
      // Check if conversation exists and is a group
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      if (!conversation.isGroup) {
        throw new Error("Cannot remove members from non-group conversation");
      }

      // Check if user is actually in the group
      const participantIds = conversation.participants.map((p) => p.toString());
      const userIdString = userId.toString();
      const isParticipant = participantIds.includes(userIdString);

      if (!isParticipant) {
        throw new Error("User is not a member of this group");
      }

      // Check if user is removing themselves (self-removal) or if current user is the owner
      const isSelRemoval = userId === currentUserId;
      const isOwner =
        conversation.createdBy.toString() === currentUserId.toString();

      if (!isSelRemoval && !isOwner) {
        throw new Error(
          "Only the group owner can remove other members from the group"
        );
      }

      // Prevent owner from removing themselves
      if (isSelRemoval && isOwner) {
        throw new Error("Group owner cannot remove themselves from the group");
      }

      // Remove user from conversation participants and update timestamp
      const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          $pull: { participants: userId },
          updatedAt: new Date(),
        },
        { new: true }
      );

      // Remove UserConversation record
      await UserConversation.deleteOne({
        conversationId: conversationId,
        userId: userId,
      });

      // Get user data and create system message
      const [user, currentUser] = await Promise.all([
        userProfileService.getUser(userId),
        userProfileService.getUser(currentUserId),
      ]);

      const removedUserName = user?.fullName || user?.username || "User";
      const actionPerformerName =
        currentUser?.fullName || currentUser?.username || "Someone";

      // Check if user removed themselves or were removed by someone else
      const content = isSelRemoval
        ? `${removedUserName} left the group`
        : `${actionPerformerName} removed ${removedUserName} from the group`;

      const systemMsg = await Message.create({
        conversationId,
        senderId: currentUserId,
        type: "SYSTEM",
        systemType: isSelRemoval ? "USER_LEAVE" : "USER_REMOVED",
        content,
        meta: {
          actionPerformer: {
            userId: currentUserId,
            fullName: currentUser?.fullName || currentUser?.username || "User",
            username: currentUser?.username || "user",
          },
          removedUser: {
            userId,
            fullName: user?.fullName || user?.username || "User",
            username: user?.username || "user",
          },
          isSelRemoval,
        },
      });

      // Update last message and timestamp
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: systemMsg._id,
        updatedAt: new Date(),
      });

      await publish(REDIS_CHANNEL.REMOVE_MEMBER, {
        conversationId,
        removedUserId: userId,
        conversation: updatedConversation,
        systemMessage: systemMsg,
      });

      return {
        conversationId,
        conversation: updatedConversation,
        removedUserId: userId,
        systemMessage: systemMsg,
      };
    } catch (error) {
      throw new Error("Error removing member from group: " + error.message);
    }
  }

  async leaveGroup(conversationId, userId) {
    await Conversation.findByIdAndUpdate(conversationId, {
      $pull: { participants: userId },
    });
    await UserConversation.deleteOne({ conversationId, userId });

    const user = await userProfileService.getUser(userId);
    const systemMsg = await Message.create({
      conversationId,
      senderId: userId,
      type: "SYSTEM",
      systemType: "USER_LEAVE",
      content: `${user?.fullName || user?.username || "User"} left the group`,
      meta: {
        userId,
        fullName: user?.fullName || user?.username || "User",
        username: user?.username || "user",
      },
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: systemMsg._id,
    });

    // Publish USER_LEAVE event to Redis for all participants
    await publish(REDIS_CHANNEL.LEAVE_GROUP, {
        conversationId: conversationId.toString(),
        userId: userId.toString(),
        message: systemMsg.content,
        createdAt: systemMsg.createdAt,
        systemMessage: {
          content: systemMsg.content,
          createdAt: systemMsg.createdAt,
          meta: systemMsg.meta,
      },
    });
    // emitToRoom(conversationId, EVENTS.RECEIVE_MESSAGE, {
    //   conversationId,
    //   type: 'SYSTEM',
    //   systemType: 'USER_LEAVE',
    //   meta: { userId, fullName: fullName },
    // });
    // emitToRoom(conversationId, EVENTS.LEAVE_GROUP_NOTIFY, { userId, conversationId });
    // emitToUser(userId, EVENTS.LEAVE_GROUP, { userId, conversationId });

    return true;
  }

  async clearConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      const currentTime = new Date();
      const userUpdateConversation = await UserConversation.findOneAndUpdate(
        { conversationId, userId },
        { isDeleted: true,
          clearAt: currentTime,
          updatedAt: currentTime
        },
        { new: true }
      );

      if (!userUpdateConversation) {
        throw new Error("User is not a participant in this conversation");
      }

      return {
        success: true,
        clearAt: userUpdateConversation.clearAt,
        message: "Conversation cleared successfully"
      };
    } catch (error) {
      throw new Error("Error clearing conversation: " + error.message);
    }
  }
}

export default ConversationService;