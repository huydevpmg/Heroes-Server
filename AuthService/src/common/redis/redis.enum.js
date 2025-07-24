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
