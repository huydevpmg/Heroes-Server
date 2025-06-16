import express from 'express';
import UserConversationController from '../controllers/userConversation.controller.js';
import { protectRoute } from '../middleware/socketAuth.js';

const router = express.Router();
const userConversationController = new UserConversationController();

// Auth middleware
router.use(protectRoute);

// Update info
router.put('/:userConversationId', userConversationController.updateUserConversation);

// Toggle archive
router.put('/:userConversationId/archive', userConversationController.toggleArchive);

// Add label
router.post('/:userConversationId/labels', userConversationController.addLabel);

// Remove label
router.delete('/:userConversationId/labels', userConversationController.removeLabel);

// Mark as read
router.put('/:userConversationId/read', userConversationController.markAsRead);

// Toggle pin
router.put('/:userConversationId/pin', userConversationController.togglePin);

export default router;