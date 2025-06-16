import express from 'express';
import LabelController from '../controllers/label.controller.js';
import { protectRoute } from '../middleware/socketAuth.js';

const router = express.Router();
const labelController = new LabelController();

// Auth middleware for all label routes
router.use(protectRoute);

// Create a new label
router.post('/', labelController.createLabel);

// Get all labels for current user
router.get('/', labelController.getUserLabels);

// Update a label
router.put('/:labelId', labelController.updateLabel);

// Delete a label
router.delete('/:labelId', labelController.deleteLabel);

export default router;

