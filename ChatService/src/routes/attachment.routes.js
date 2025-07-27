import express from 'express';
import multer from 'multer';
import AttachmentController from '../controllers/attachment.controller.js';

const router = express.Router();
const controller = new AttachmentController();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/', upload.array('files'), controller.createAttachments);
router.get('/', controller.getAttachments);
router.get('/type', controller.getAttachmentsByType);
router.get('/:id', controller.getAttachmentById);
router.delete('/:id', controller.deleteAttachment);
router.get('/user/:userId', controller.getAttachmentsByUser);

export default router;