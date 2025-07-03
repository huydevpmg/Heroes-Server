import ReadReceiptService from "../services/readReceipt.service.js";
import { emitToRoom } from "../lib/socket/index.js";
import { EVENTS } from "../lib/socket/events.enum.js";

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
      const { messageId } = req.params;
      const { userId, conversationId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      if (!conversationId) {
        return res.status(400).json({ message: 'Conversation ID is required' });
      }

      const readReceipt = await this.readReceiptService.markMessageAsRead(
        messageId, 
        userId, 
        conversationId
      );

      // Just emit if it's a new read receipt
      if (readReceipt.isNewRead) {
        emitToRoom(conversationId, EVENTS.READ_RECEIPT_UPDATED, {
          messageId,
          userId,
          readAt: readReceipt.readAt,
          conversationId,
          user: readReceipt.user
        });
      }

      return res.status(200).json({
        message: 'Message marked as read successfully',
        data: readReceipt
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Mark multiple messages as read (bulk)
   * POST /api/conversations/:conversationId/read
   */
  markMultipleMessagesAsRead = async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { userId, messageIds } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      if (!messageIds || !Array.isArray(messageIds)) {
        return res.status(400).json({ message: 'Message IDs array is required' });
      }

      const result = await this.readReceiptService.markMultipleMessagesAsRead(
        messageIds,
        userId,
        conversationId
      );

      // Emit socket event for bulk read
      emitToRoom(conversationId, EVENTS.READ_RECEIPT_UPDATED, {
        userId,
        messageIds,
        readAt: new Date(),
        conversationId,
        type: 'bulk'
      });

      return res.status(200).json({
        message: 'Messages marked as read successfully',
        data: {
          modifiedCount: result.modifiedCount,
          upsertedCount: result.upsertedCount
        }
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
}

export default ReadReceiptController;
