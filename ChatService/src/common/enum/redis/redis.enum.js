// Redis channel names
export const REDIS_CHANNEL = {
  CHAT_MESSAGE: 'chat_message',
  USER_PROFILE_UPDATED: 'user_profile_updated',
  CONVERSATION_UPDATED: 'conversation_updated',
  MESSAGE_DELETED: 'message_deleted',
  REACTION_UPDATED: 'reaction_updated',
  TYPING: 'typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  NOTIFICATION: 'notification',
  MESSAGE_UPDATED: 'message_updated',

  ATTACHMENT_CREATED: 'attachment_created',
  ATTACHMENT_DELETED: 'attachment_deleted',
  ATTACHMENT_UPDATED: 'attachment_updated',
  LEAVE_GROUP: 'leave_group',
  REMOVE_MEMBER: 'remove_member',
  ADD_MEMBER: 'add_member',
  CONVERSATION_CREATED: 'conversation_created',

  REACTION_ADDED: 'reaction_added',
  REACTION_REMOVED: 'reaction_removed',
  MESSAGE_REACTION: 'message_reaction',
  REMOVE_REACTION: 'remove_reaction',

  READ_RECEIPT: 'read_receipt',
};

// Redis cache key patterns
export const REDIS_CACHE_KEY = {
  USER_PROFILE: (userId) => `user_profile:${userId}`,
  ALL_USERS: 'user_profile:all',
  CONVERSATION: (conversationId) => `conversation:${conversationId}`,
  USER_CONVERSATIONS: (userId) => `user_conversations:${userId}`,
  LAST_MESSAGE: (userId, conversationId) => `last_message:${userId}:${conversationId}`,
  UNREAD_COUNT: (userId, conversationId) => `unread_count:${userId}:${conversationId}`,
};

// Redis cache type enum
export const REDIS_CACHE_TYPE = {
  STRING: 'string',
  HASH: 'hash',
  SET: 'set',
  LIST: 'list',
};
