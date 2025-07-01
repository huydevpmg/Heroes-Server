import express from 'express';
import ConversationController from '../controllers/conversation.controller.js';
import { protectRoute } from '../middleware/socketAuth.js';

const router = express.Router();
const conversationController = new ConversationController();

//POST 1on1 conversation
router.post('/1on1', protectRoute, conversationController.findOrCreate1on1Conversation);

//POST group conversation
router.post('/', protectRoute, conversationController.createConversation);

//GET all conversations list
router.get('/', protectRoute, conversationController.getConversations);

//GET conversation by ID
router.get('/:id', protectRoute, conversationController.getConversationById);

//PUT update conversation
router.patch('/:id', protectRoute, conversationController.updateConversation);

// PATCH lastAttachmentName
router.patch('/:id/last-attachment', protectRoute, conversationController.updateLastAttachmentName);

// PATCH leave group
router.patch('/leave/:id', protectRoute, conversationController.leaveGroup);

router.get('/users', protectRoute, conversationController.getAllUsers);

//DELETE conversation
// router.delete('/:id', protectRoute, conversationController.deleteConversation);

export default router;