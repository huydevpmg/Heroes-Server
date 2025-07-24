import express from 'express';
import ConversationController from '../controllers/conversation.controller.js';
import { protectRoute } from '../middleware/socketAuth.js';

const router = express.Router();
const conversationController = new ConversationController();


//POST group or 1-1 conversation
router.post('/', protectRoute, conversationController.findOrCreateConversation);

// POST add members to group
router.post('/:id/members', protectRoute, conversationController.addMemberToGroup);

// DELETE remove member from group
router.delete('/:id/members', protectRoute, conversationController.removeMemberFromGroup);

//GET all conversations list
router.get('/', protectRoute, conversationController.getConversations);

//GET all users (must be before /:id route)
router.get('/users', protectRoute, conversationController.getAllUsers);

//GET conversation by ID
router.get('/:id', protectRoute, conversationController.getConversationById);

//PUT update conversation
router.patch('/:id', protectRoute, conversationController.updateConversation);

// PATCH lastAttachmentName
router.patch('/:id/last-attachment', protectRoute, conversationController.updateLastAttachmentName);

// PATCH clear conversation
router.patch('/:id/clear', protectRoute, conversationController.clearConversation);

// PATCH leave group
router.patch('/leave/:id', protectRoute, conversationController.leaveGroup);

router.get('/users', protectRoute, conversationController.getAllUsers);

//DELETE conversation
// router.delete('/:id', protectRoute, conversationController.deleteConversation);

export default router;