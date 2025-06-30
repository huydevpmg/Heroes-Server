import express from 'express';
import MessageController from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/socketAuth.js';

const router = express.Router();
const messageController = new MessageController();

// Auth middleware for all message routes
router.use(protectRoute);

// POST create a new message
router.post('/', messageController.createMessage);

// GET all messages for a conversation
router.get('/', messageController.getMessages);

// PUT update message status
router.put('/:messageId/status', messageController.updateMessageStatus);

// PUT update message content
router.put('/:messageId', messageController.updateMessage);

// PATCH (soft-delete)
router.patch('/:messageId/delete', messageController.deleteMessage);

// POST add a reaction to a message
router.post('/:messageId/reactions', messageController.addReaction);
//DELETE remove a reaction from a message
router.delete('/:messageId/reactions', messageController.removeReaction);

export default router;