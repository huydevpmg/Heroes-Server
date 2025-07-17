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

      emitToRoom(conversationId, EVENTS.READ_RECEIPT_UPDATED, {
        messageId,
        userId,
        readAt: receipt.readAt,
        conversationId,
        user: receipt.user,
        type: 'single',
      });

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

      emitToRoom(conversationId, EVENTS.READ_RECEIPT_UPDATED, {
        userId,
        messageIds,
        readAt: new Date(),
        conversationId,
        user: receipts[0]?.user || null,
        receipts,
        type: 'bulk',
      });

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
}

export default ReadReceiptController;
