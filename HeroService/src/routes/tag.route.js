import express from 'express';
import * as TagController from '../controllers/tag.controller.js';
import { verifyAccessToken } from '../middleware/verifyAccess.js';

const tagRouter = express.Router();

tagRouter.use(verifyAccessToken);
tagRouter.get('/', TagController.getAllTags);
tagRouter.get('/:id', TagController.getTagById);
tagRouter.post('/', TagController.createTag);
tagRouter.put('/:id', TagController.updateTag);
tagRouter.delete('/:id', TagController.deleteTag);

export default tagRouter;
