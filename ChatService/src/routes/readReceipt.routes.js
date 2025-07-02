import express from "express";
import ReadReceiptController from "../controllers/readReceipt.controller.js";

const router = express.Router();
const readReceiptController = new ReadReceiptController();

// Mark single message as read
router.post("/messages/:messageId/read", readReceiptController.markMessageAsRead);

// Mark multiple messages as read (bulk)
router.post("/conversations/:conversationId/read", readReceiptController.markMultipleMessagesAsRead);

// Get read receipts for a single message
router.get("/messages/:messageId/read-receipts", readReceiptController.getMessageReadReceipts);

// Get read receipts for conversation
router.get("/conversations/:conversationId/read-receipts", readReceiptController.getConversationReadReceipts);

// Get users who read all messages up to specific message
router.get("/conversations/:conversationId/read-all/:messageId", readReceiptController.getUsersWhoReadAll);

export default router;
