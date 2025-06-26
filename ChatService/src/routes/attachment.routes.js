import express from 'express';
import AttachmentController from '../controllers/attachment.controller.js';

const router = express.Router();

const controller = new AttachmentController();

router.post('/', upload.single('file'), controller.createAttachment);
router.get('/', controller.getAttachments);
router.get('/type', controller.getAttachmentsByType);
router.get('/:id', controller.getAttachmentById);
router.delete('/:id', controller.deleteAttachment);
router.get('/user/:userId', controller.getAttachmentsByUser);

export default router;