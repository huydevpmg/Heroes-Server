import express from 'express';
import conversationRoutes from './conversation.routes.js';
import messageRoutes from './message.routes.js';
import userConversationRoutes from './userConversation.routes.js';
import attachmentRoutes from './attachment.routes.js';
import labelRoutes from './label.routes.js';

const router = express.Router();

router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/user-conversations', userConversationRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/labels', labelRoutes);

export default router;