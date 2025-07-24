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

// PUT update message content
router.put('/:messageId', messageController.updateMessage);

// PATCH (soft-delete)
router.patch('/:messageId/delete', messageController.deleteMessage);

export default router;