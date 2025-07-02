export const EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // User presence
  USER_STATUS_CHANGE: 'user_status_change',

  // Typing indicators
  TYPING: 'typing',
  USER_TYPING: 'user_typing',

  // Message events
  NEW_MESSAGE: 'message',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED_GLOBAL: 'message_deleted_global',
  MESSAGE_DELETED_PERSONAL: 'message_deleted_personal',
  MESSAGE_STATUS_UPDATED: 'message_status_updated',

  // Reaction events
  REACTION_ADDED: 'message_reaction_added',
  REACTION_REMOVED: 'message_reaction_removed',

  // Attachment events
  ATTACHMENT_CREATED: 'attachment_created',
  ATTACHMENT_DELETED: 'attachment_deleted',

  // Conversation events
  GROUP_CREATED: 'group_created',

  // Read receipt events
  MESSAGE_READ: 'message_read',
  READ_RECEIPT_UPDATED: 'read_receipt_updated',
  BULK_MESSAGE_READ: 'bulk_message_read',
};
