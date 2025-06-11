import Conversation from '../models/conversation.model.js';
import UserConversation from '../models/userConversation.model.js';

export const findOrCreate1on1Conversation = async (userId1, userId2) => {
  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: { $all: [userId1, userId2], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId1, userId2],
      isGroup: false,
      creator: userId1,
    });
    await Promise.all([
      UserConversation.create({ user: userId1, conversation: conversation._id }),
      UserConversation.create({ user: userId2, conversation: conversation._id }),
    ]);
  }
  return conversation;
};

export const createGroupConversation = async ({ name, creator, members }) => {
  const conversation = await Conversation.create({
    name,
    participants: members,
    isGroup: true,
    creator,
  });
  await Promise.all(
    members.map((userId) =>
      UserConversation.create({ user: userId, conversation: conversation._id })
    )
  );
  return conversation;
};

// ... thêm các hàm quản lý group/conversation khác nếu cần