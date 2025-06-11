import express from "express";
import {
    connect1on1Conversation,
    createGroup,
    // getUserConversations,
    // addParticipant,
    // removeParticipant,
    // renameConversation,
    // getConversationDetail,
} from "../controllers/conversation.controller.js";
const conversationRoutes = express.Router();

// Create or find 1-on-1 room between 2 users
conversationRoutes.post("/connect", connect1on1Conversation);

// Create a new group
conversationRoutes.post("/create-group", createGroup);

// Get user's conversation list
// conversationRoutes.get("/", getUserConversations);

// // Get conversation details
// conversationRoutes.get("/:conversationId", getConversationDetail);

// // Add participant to group (group only)
// conversationRoutes.post("/:conversationId/add-participant", addParticipant);

// // Remove participant from group (group only)
// conversationRoutes.post("/:conversationId/remove-participant", removeParticipant);

// // Rename group
// conversationRoutes.post("/:conversationId/rename", renameConversation);

export default conversationRoutes;