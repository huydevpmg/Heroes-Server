import MessageReadReceipt from "../models/messageReadReceipt.model.js";
import Message from "../models/message.model.js";
import axios from "axios";

class ReadReceiptService {
  async markMessageAsRead(messageId, userId, conversationId) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      let readReceipt = await MessageReadReceipt.findOne({ messageId, userId });
      let isNewRead = false;

      if (!readReceipt) {
        readReceipt = await MessageReadReceipt.create({
          messageId,
          userId,
          conversationId,
          readAt: new Date()
        });
        isNewRead = true;
      }
      const user = await this.getUserData(userId);

      return {
        messageId: readReceipt.messageId,
        userId: readReceipt.userId,
        readAt: readReceipt.readAt,
        conversationId: readReceipt.conversationId,
        user: user || null,
        isNewRead: isNewRead
      };
    } catch (error) {
      throw new Error("Error marking message as read: " + error.message);
    }
  }

  async markMultipleMessagesAsRead(messageIds, userId, conversationId) {
    try {

      // Get all messageIds and just select the messageId
      const existingReceipts = await MessageReadReceipt.find({
        messageId: { $in: messageIds },
        userId
      }).select('messageId');

      const existingMessageIds = new Set(existingReceipts.map(r => r.messageId.toString()));

      const now = new Date();
      const toCreate = messageIds.filter(id => !existingMessageIds.has(id.toString()));

      if (toCreate.length > 0) {
        await MessageReadReceipt.insertMany(
          toCreate.map(messageId => ({
            messageId,
            userId,
            conversationId,
            readAt: now
          }))
        );
      }

      const user = await this.getUserData(userId);

      return messageIds.map(messageId => ({
        messageId,
        userId,
        readAt: now,
        conversationId,
        user: user || null
      }));
    } catch (error) {
      throw new Error("Error marking messages as read: " + error.message);
    }
  }

  async getMessageReadReceipts(messageId, conversationId) {
    try {
      const query = { messageId };
      if (conversationId) query.conversationId = conversationId;

      const readReceipts = await MessageReadReceipt.find(query).sort({ readAt: -1 });
      const uniqueReceipts = readReceipts.filter((receipt, index, self) => 
        index === self.findIndex(r => r.userId.toString() === receipt.userId.toString())
      );
      
      const userIds = [...new Set(uniqueReceipts.map(r => r.userId.toString()))];
      const users = await this.getUsersFromAuthService(userIds);

      return uniqueReceipts.map(receipt => ({
        messageId: receipt.messageId,
        userId: receipt.userId,
        readAt: receipt.readAt,
        conversationId: receipt.conversationId,
        user: users[receipt.userId.toString()] || null
      }));
    } catch (error) {
      throw new Error("Error getting message read receipts: " + error.message);
    }
  }

  async getConversationReadReceipts(conversationId, messageIds = []) {
    try {
      const query = { conversationId };
      if (messageIds.length > 0) {
        query.messageId = { $in: messageIds }
      };

      const readReceipts = await MessageReadReceipt.find(query).sort({ readAt: -1 });
      const userIds = [...new Set(readReceipts.map(r => r.userId.toString()))];
      const users = await this.getUsersFromAuthService(userIds);

      const receiptsByMessage = {};
      readReceipts.forEach(receipt => {
        const msgId = receipt.messageId.toString();
        if (!receiptsByMessage[msgId]) {
          receiptsByMessage[msgId] = []
        };
        receiptsByMessage[msgId].push({
          messageId: receipt.messageId,
          userId: receipt.userId,
          readAt: receipt.readAt,
          conversationId: receipt.conversationId,
          user: users[receipt.userId.toString()] || null
        });
      });

      return receiptsByMessage;
    } catch (error) {
      throw new Error("Error getting conversation read receipts: " + error.message);
    }
  }

  async getUsersWhoReadAll(conversationId, lastMessageId) {
    try {
      const lastMessage = await Message.findById(lastMessageId);
      if (!lastMessage) {throw new Error("Last message not found")};

      const messages = await Message.find({
        conversationId,
        createdAt: { $lte: lastMessage.createdAt }
      }).select('_id');

      const messageIds = messages.map(m => m._id.toString());
      const readReceipts = await MessageReadReceipt.find({
        conversationId,
        messageId: { $in: messageIds }
      });

      const receiptsByUser = {};
      readReceipts.forEach(receipt => {
        const userId = receipt.userId.toString();
        if (!receiptsByUser[userId]) receiptsByUser[userId] = new Set();
        receiptsByUser[userId].add(receipt.messageId.toString());
      });

      const usersWhoReadAll = Object.keys(receiptsByUser).filter(userId =>
        receiptsByUser[userId].size === messageIds.length
      );

      const users = await this.getUsersFromAuthService(usersWhoReadAll);
      return usersWhoReadAll.map(userId => users[userId]).filter(Boolean);
    } catch (error) {
      throw new Error("Error getting users who read all: " + error.message);
    }
  }

  async getUsersFromAuthService(userIds) {
    try {
      if (!userIds || !userIds.length) return {};
      const usersArr = await Promise.all(userIds.map(id => this.getUserData(id)));
      const userMap = {};
      usersArr.forEach(user => {
        if (user && user._id) userMap[user._id] = user;
      });
      return userMap;
    } catch (error) {
      console.error('Error fetching users from AuthService:', error.message);
      return {};
    }
  }

  async getUserData(userId) {
    try {
      const response = await axios.get(
        `${process.env.AUTH_SERVICE_URL || 'http://localhost:4000'}api/profile/${userId}`
      );
      const { _id, fullName, username, email, avatar } = response.data;
      return { _id, fullName, username, email, avatar };
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      return null;
    }
  }
}

export default ReadReceiptService;