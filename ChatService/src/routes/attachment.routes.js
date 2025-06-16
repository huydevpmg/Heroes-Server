import express from 'express';
import AttachmentController from '../controllers/attachment.controller.js';

const router = express.Router();
const attachmentController = new AttachmentController();

router.post('/', attachmentController.createAttachment);
router.get('/', attachmentController.getAttachments);
router.get('/type', attachmentController.getAttachmentsByType);
router.get('/:id', attachmentController.getAttachmentById);
router.delete('/:id', attachmentController.deleteAttachment);
router.get('/user/:userId', attachmentController.getAttachmentsByUser);

export default router; 