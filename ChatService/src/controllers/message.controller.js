import { getMessagesService, sendMessageService } from "../services/message.service.js";

/**
 * POST /api/messages
 * Send a message to a conversation
 */
const userId = "68464832d4a4d83463a4880e"

export const sendMessage = async (req, res) => {
  try {

    // const { userId } = req.user;
    const { conversationId, content, attachments } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ success: false, message: 'conversationId and content are required' });
    }

    const message = await sendMessageService({
      conversationId,
      senderId: userId,
      content,
      attachments: attachments || [],
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/messages/:conversationId?limit=20&skip=0
 * Get messages from a conversation with pagination
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit, skip } = req.query;

    const messages = await getMessagesService(
      conversationId,
      Number(limit) || 20,
      Number(skip) || 0
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};