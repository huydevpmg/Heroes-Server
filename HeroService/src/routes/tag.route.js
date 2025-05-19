import express from 'express';
import {
  getTags,
  createTag,
  deleteTag,
  getTagStyle,
} from '../controllers/tag.controller.js';
import { verifyAccessToken } from '../utils/verifyAccess.js';

const tagRoute = express.Router();

tagRoute.get('/', verifyAccessToken, getTags);
tagRoute.post('/', verifyAccessToken, createTag);
tagRoute.delete('/:id', verifyAccessToken, deleteTag);

tagRoute.get('/style', getTagStyle);

export default tagRoute;
