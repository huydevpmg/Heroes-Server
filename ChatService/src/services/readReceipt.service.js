import MessageReadReceipt from "../models/messageReadReceipt.model.js";
import Message from "../models/message.model.js";
import UserConversation from "../models/userConversation.model.js";
import userProfileService from "./userProfile.service.js";
import { publish } from "../lib/redis/redis.js";
import { REDIS_CHANNEL } from "../common/enum/redis/redis.enum.js";
import { EVENTS } from "../common/enum/socket/socket.enum.js";

class ReadReceiptService {
  async markMultipleMessagesAsRead(messageIds, userId, conversationId) {
    try {
      const now = new Date();

      const messages = await Message.find({ _id: { $in: messageIds } }).select(
        "_id"
      );
      const validMessageIds = messages.map((m) => m._id.toString());

      const bulkOps = validMessageIds.map((messageId) => ({
        updateOne: {
          filter: { messageId, userId },
          update: {
            $setOnInsert: { messageId, userId, conversationId, readAt: now },
          },
          upsert: true,
        },
      }));

      await MessageReadReceipt.bulkWrite(bulkOps, { ordered: false });

      if (validMessageIds.length) {
        const lastMessageId = validMessageIds[validMessageIds.length - 1];
        await UserConversation.updateOne(
          { conversationId, userId },
          { $set: { lastReadAt: now, lastReadMessage: lastMessageId } }
        );
      }

      const user = await userProfileService.getUser(userId);

      const receipts = validMessageIds.map((messageId) => ({
        messageId,
        userId,
        readAt: now,
        conversationId,
        user,
      }));

      const payload = {
        userId,
        conversationId,
        user,
        readAt: now,
        receipts,
        type: receipts.length === 1 ? "single" : "bulk",
        messageIds: receipts.map((r) => r.messageId),
      };

      await publish(REDIS_CHANNEL.READ_RECEIPT, payload);

      return receipts;
    } catch (error) {
      throw new Error("Error marking messages as read: " + error.message);
    }
  }

  async markMessageAsRead(messageId, userId, conversationId) {
    const [result] = await this.markMultipleMessagesAsRead(
      [messageId],
      userId,
      conversationId
    );
    return { ...result, isNewRead: true };
  }

  async getMessageReadReceipts(messageId, conversationId) {
    try {
      const query = { messageId };
      if (conversationId) {
        query.conversationId = conversationId;
      }

      const readReceipts = await MessageReadReceipt.find(query).sort({
        readAt: -1,
      });
      const uniqueReceipts = readReceipts.filter(
        (receipt, index, self) =>
          index ===
          self.findIndex(
            (r) => r.userId.toString() === receipt.userId.toString()
          )
      );

      const userIds = [
        ...new Set(uniqueReceipts.map((r) => r.userId.toString())),
      ];
      const users = await this.getUsersFromCache(userIds);

      return uniqueReceipts.map((receipt) => ({
        messageId: receipt.messageId,
        userId: receipt.userId,
        readAt: receipt.readAt,
        conversationId: receipt.conversationId,
        user: users[receipt.userId.toString()] || null,
      }));
    } catch (error) {
      throw new Error("Error getting message read receipts: " + error.message);
    }
  }

  async getConversationReadReceipts(conversationId, messageIds = []) {
    try {
      const query = { conversationId };
      if (messageIds.length > 0) {
        query.messageId = { $in: messageIds };
      }

      const readReceipts = await MessageReadReceipt.find(query).sort({
        readAt: -1,
      });
      const userIds = [
        ...new Set(readReceipts.map((r) => r.userId.toString())),
      ];
      const users = await this.getUsersFromCache(userIds);

      const receiptsByMessage = {};
      readReceipts.forEach((receipt) => {
        const msgId = receipt.messageId.toString();
        if (!receiptsByMessage[msgId]) {
          receiptsByMessage[msgId] = [];
        }
        receiptsByMessage[msgId].push({
          messageId: receipt.messageId,
          userId: receipt.userId,
          readAt: receipt.readAt,
          conversationId: receipt.conversationId,
          user: users[receipt.userId.toString()] || null,
        });
      });

      return receiptsByMessage;
    } catch (error) {
      throw new Error(
        "Error getting conversation read receipts: " + error.message
      );
    }
  }

  async getUsersWhoReadAll(conversationId, lastMessageId) {
    try {
      const lastMessage = await Message.findById(lastMessageId);
      if (!lastMessage) {
        throw new Error("Last message not found");
      }

      const messages = await Message.find({
        conversationId,
        createdAt: { $lte: lastMessage.createdAt },
      }).select("_id");

      const messageIds = messages.map((m) => m._id.toString());
      const readReceipts = await MessageReadReceipt.find({
        conversationId,
        messageId: { $in: messageIds },
      });

      const receiptsByUser = {};
      readReceipts.forEach((receipt) => {
        const userId = receipt.userId.toString();
        if (!receiptsByUser[userId]) {
          receiptsByUser[userId] = new Set();
        }
        receiptsByUser[userId].add(receipt.messageId.toString());
      });

      const usersWhoReadAll = Object.keys(receiptsByUser).filter(
        (userId) => receiptsByUser[userId].size === messageIds.length
      );

      const users = await this.getUsersFromCache(usersWhoReadAll);
      return usersWhoReadAll.map((userId) => users[userId]).filter(Boolean);
    } catch (error) {
      throw new Error("Error getting users who read all: " + error.message);
    }
  }

  async getUsersFromCache(userIds) {
    try {
      if (!userIds || !userIds.length) {
        return {};
      }
      const usersArr = await userProfileService.getUsers(userIds);
      const userMap = {};
      usersArr.forEach((user) => {
        if (user && user._id) {
          userMap[user._id] = user;
        }
      });
      return userMap;
    } catch (error) {
      console.error("Error fetching users from cache:", error.message);
      return {};
    }
  }

  async getUserData(userId) {
    return userProfileService.getUser(userId);
  }

  /**
   * Get unread message IDs for a user in a conversation
   */
  async getUnreadMessageIds(conversationId, userId) {
    const messages = await Message.find({ conversationId });
    const receipts = await MessageReadReceipt.find({ conversationId, userId });
    const readIds = new Set(receipts.map((r) => r.messageId.toString()));
    return messages
      .filter(
        (m) =>
          !readIds.has(m._id.toString()) && m.senderId.toString() !== userId
      )
      .map((m) => m._id.toString());
  }
}

export default ReadReceiptService;
