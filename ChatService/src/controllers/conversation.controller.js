import { createGroupConversation, findOrCreate1on1Conversation } from "../services/conversation.service.js";

// POST /api/conversations/1on1
export const connect1on1Conversation = async (req, res) => {
  try {
    // const { userId } = req.user;
    const userId = "68464832d4a4d83463a4880e"
    const { partnerId } = req.body;
    const conversation = await findOrCreate1on1Conversation(userId, partnerId);
    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/conversations/group
export const createGroup = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, members } = req.body;
    const conversation = await createGroupConversation({ name, creator: userId, members });
    res.status(201).json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};