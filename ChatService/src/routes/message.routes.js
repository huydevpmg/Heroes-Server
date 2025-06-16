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

// GET a specific message by ID
router.put('/:messageId/status', messageController.updateMessageStatus);

//PATCH update a message by ID
// router.patch('/:messageId', messageController.updateMessage);

// DELETE a message by ID
router.delete('/:messageId', messageController.deleteMessage);

// POST add a reaction to a message
router.post('/:messageId/reactions', messageController.addReaction);
//DELETE remove a reaction from a message
router.delete('/:messageId/reactions', messageController.removeReaction);

export default router;