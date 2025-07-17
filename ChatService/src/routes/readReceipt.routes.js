import express from "express";
import ReadReceiptController from "../controllers/readReceipt.controller.js";
import { protectRoute } from "../middleware/socketAuth.js";

const router = express.Router();
const readReceiptController = new ReadReceiptController();
router.use(protectRoute);

// Mark single message as read
router.post("/messages/:messageId/read", readReceiptController.markMessageAsRead);

// Mark multiple messages as read (bulk)
router.post("/conversations/:conversationId/read", readReceiptController.markMultipleMessagesAsRead);

// Mark all messages as read for current user in a conversation
router.post("/conversations/:conversationId/read-all", readReceiptController.markAllMessagesAsRead);

// Get read receipts for a single message
router.get("/messages/:messageId/read-receipts", readReceiptController.getMessageReadReceipts);

// Get read receipts for conversation
router.get("/conversations/:conversationId/read-receipts", readReceiptController.getConversationReadReceipts);

// Get users who read all messages up to specific message
router.get("/conversations/:conversationId/read-all/:messageId", readReceiptController.getUsersWhoReadAll);

export default router;
