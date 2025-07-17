import ReactionService from "../services/reaction.service.js";
import { emitToRoom } from "../lib/socket/index.js";
import { EVENTS } from "../lib/socket/events.enum.js";

class ReactionController {
  constructor() {
    this.reactionService = new ReactionService();
  }

  addReaction = async (req, res) => {
    try {
      const { messageId, emoji, conversationId } = req.body;
      const userId = req.user.id;
      const message = await this.reactionService.addReaction({
        messageId,
        emoji,
        userId,
      });

      emitToRoom(conversationId, EVENTS.MESSAGE_REACTION, {
        message,
      });

      res.json({ success: true, message });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  removeReaction = async (req, res) => {
    try {
      const { messageId, emoji, conversationId } = req.body;
      const userId = req.user.id;
      const message = await this.reactionService.removeReaction({
        messageId,
        emoji,
        userId,
      });

      emitToRoom(conversationId, EVENTS.REMOVE_REACTION, {
        message,
      });

      res.json({ success: true, message });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getReactions = async (req, res) => {
    try {
      const { messageId } = req.params;
      const reactions = await this.reactionService.getReactionsByMessage(messageId);
      res.json({ success: true, reactions });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

export default ReactionController;
