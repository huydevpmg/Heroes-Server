import express from "express";
import {
  sendMessage,
  getMessages,
  // deleteMessage,
  // updateMessage,
  // reactMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/socketAuth.js";

const messsageRoutes = express.Router();

// Send message (can include attachment)
messsageRoutes.post("/send", sendMessage);

// Get messages of a conversation
messsageRoutes.get("/:conversationId", getMessages);

// // Delete message
// messsageRoutes.delete("/:messageId", protectRoute, deleteMessage);

// // Update message content
// messsageRoutes.put("/:messageId", protectRoute, updateMessage);

// // React to message
// messsageRoutes.post("/:messageId/react", protectRoute, reactMessage);

export default messsageRoutes;