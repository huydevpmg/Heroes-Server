import LabelService from '../services/label.service.js';
import { emitToRoom } from '../lib/socket.js';

class LabelController {
  constructor() {
    this.labelService = new LabelService();
  }

  /**
   * Create a new label
   * POST /api/labels
   */
  createLabel = async (req, res) => {
    try {
      const userId = req.user.id;
      const labelData = req.body;
      
      if (!labelData.name) {
        return res.status(400).json({ message: 'Label name is required' });
      }
      
      const label = await this.labelService.createLabel(userId, labelData);
      return res.status(201).json(label);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Get all labels for current user
   * GET /api/labels
   */
  getUserLabels = async (req, res) => {
    try {
      const userId = req.user.id;
      const labels = await this.labelService.getUserLabels(userId);
      return res.status(200).json(labels);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Update a label
   * PUT /api/labels/:labelId
   */
  updateLabel = async (req, res) => {
    try {
      const userId = req.user.id;
      const { labelId } = req.params;
      const updateData = req.body;

      // Update label
      const label = await this.labelService.updateLabel(labelId, userId, updateData);
      
      if (!label) {
        return res.status(404).json({ message: 'Label not found or no permission' });
      }
      
      return res.status(200).json(label);
    } catch (error) {
      console.error('Error:', error.message); // Log specific error for debugging
      return res.status(500).json({ message: error.message });
    }
  };
  /**
   * Delete a label
   * DELETE /api/labels/:labelId
   */
  deleteLabel = async (req, res) => {
    try {
      const userId = req.user.id;
      const { labelId } = req.params;
      
      await this.labelService.deleteLabel(labelId, userId);
      return res.status(200).json({ message: 'Label deleted successfully' });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Add label to a conversation
   * POST /api/user-conversations/:userConversationId/labels
   */
  addLabelToConversation = async (req, res) => {
    try {
      const userId = req.user.id;
      const { userConversationId } = req.params;
      const { labelId } = req.body;
      
      if (!labelId) {
        return res.status(400).json({ message: 'Label ID is required' });
      }
      
      const userConversation = await this.labelService.addLabelToConversation(
        userConversationId,
        userId,
        labelId
      );

      // Emit socket event after successful label addition
      emitToRoom(userConversation.conversationId, 'add_label', {
        userConversationId,
        labelId,
        userId
      });
      
      return res.status(200).json(userConversation);
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Remove label from a conversation
   * DELETE /api/user-conversations/:userConversationId/labels/:labelId
   */
  removeLabelFromConversation = async (req, res) => {
    try {
      const userId = req.user.id;
      const { userConversationId, labelId } = req.params;
      
      const userConversation = await this.labelService.removeLabelFromConversation(
        userConversationId,
        userId,
        labelId
      );

      // Emit socket event after successful label removal
      emitToRoom(userConversation.conversationId, 'remove_label', {
        userConversationId,
        labelId,
        userId
      });
      
      return res.status(200).json(userConversation);
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  };
}

export default LabelController;