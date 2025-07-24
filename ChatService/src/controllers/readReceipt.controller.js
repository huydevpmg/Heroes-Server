import ReadReceiptService from "../services/readReceipt.service.js";
import { emitToRoom } from "../lib/socket/index.js";
import { EVENTS } from "../common/enum/socket/socket.enum.js";

class ReadReceiptController {
  constructor() {
    this.readReceiptService = new ReadReceiptService();
  }

  /**
   * Mark a message as read
   * POST /api/messages/:messageId/read
   */
  markMessageAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;
      const { conversationId } = req.body;

      if (!userId || !conversationId) {
        return res.status(400).json({ message: 'Missing userId or conversationId' });
      }

      const [receipt] = await this.readReceiptService.markMultipleMessagesAsRead(
        [messageId],
        userId,
        conversationId
      );

      return res.status(200).json({
        message: 'Message marked as read successfully',
        data: receipt,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  markMultipleMessagesAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const { messageIds } = req.body;

      if (!userId || !Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ message: 'Invalid userId or messageIds' });
      }

      const receipts = await this.readReceiptService.markMultipleMessagesAsRead(
        messageIds,
        userId,
        conversationId
      );

      return res.status(200).json({
        message: 'Messages marked as read successfully',
        data: receipts,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Get users who have read a specific message
   * GET /api/messages/:messageId/read-receipts?conversationId=xxx
   */
  getMessageReadReceipts = async (req, res) => {
    try {
      const { messageId } = req.params;
      const { conversationId } = req.query; // lấy từ query param nếu có

      const readReceipts = await this.readReceiptService.getMessageReadReceipts(messageId, conversationId);

      return res.status(200).json({
        message: 'Read receipts retrieved successfully',
        data: readReceipts
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Get read receipts for multiple messages in a conversation
   * GET /api/conversations/:conversationId/read-receipts?messageIds=...
   */
  getConversationReadReceipts = async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { messageIds } = req.query;

      let messageIdArray = [];
      if (messageIds) {
        messageIdArray = Array.isArray(messageIds) ? messageIds : messageIds.split(',');
      }

      const readReceipts = await this.readReceiptService.getConversationReadReceipts(
        conversationId,
        messageIdArray
      );

      return res.status(200).json({
        message: 'Conversation read receipts retrieved successfully',
        data: readReceipts
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Get users who have read all messages up to a specific message
   * GET /api/conversations/:conversationId/read-all/:messageId
   */
  getUsersWhoReadAll = async (req, res) => {
    try {
      const { conversationId, messageId } = req.params;

      const users = await this.readReceiptService.getUsersWhoReadAll(
        conversationId,
        messageId
      );

      return res.status(200).json({
        message: 'Users who read all messages retrieved successfully',
        data: users
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Mark all messages as read for current user in a conversation
   * POST /api/conversations/:conversationId/read-all
   */
  markAllMessagesAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      if (!userId || !conversationId) {
        return res.status(400).json({ message: 'Missing userId or conversationId' });
      }
      // Lấy tất cả message chưa đọc của user trong conversation
      const unreadMessageIds = await this.readReceiptService.getUnreadMessageIds(conversationId, userId);
      if (!unreadMessageIds.length) {
        return res.status(200).json({ message: 'No unread messages', data: [] });
      }
      const receipts = await this.readReceiptService.markMultipleMessagesAsRead(
        unreadMessageIds,
        userId,
        conversationId
      );
      emitToRoom(conversationId, EVENTS.READ_RECEIPT_UPDATED, {
        userId,
        receipts,
        type: 'bulk',
        conversationId,
      });
      return res.status(200).json({
        message: 'All messages marked as read successfully',
        data: receipts,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default ReadReceiptController;
