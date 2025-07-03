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
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  EDIT_MESSAGE: 'edit_message',
  DELETE_MESSAGE: 'delete_message',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED_GLOBAL: 'message_deleted_global',
  MESSAGE_DELETED_PERSONAL: 'message_deleted_personal',
  MESSAGE_STATUS_UPDATED: 'message_status_updated',

  // Reaction events
  MESSAGE_REACTION: 'message_reaction',
  REMOVE_REACTION: 'remove_reaction',

  // Attachment events
  ATTACHMENT_CREATED: 'attachment_created',
  ATTACHMENT_DELETED: 'attachment_deleted',

  // Conversation events
  JOIN_ROOM: 'join_room',
  CONNECT_CONVERSATION: 'connect_conversation',
  GROUP_CREATED: 'group_created',

  // Read receipt events
  MESSAGE_READ: 'message_read',
  READ_RECEIPT_UPDATED: 'read_receipt_updated',
  BULK_MESSAGE_READ: 'bulk_message_read',
  NEW_GROUP: 'new_group',
  LEAVE_GROUP: 'user_left_group',
  LEAVE_GROUP_NOTIFY: 'user_left_group_notify',
  PIN_CONVERSATION: 'pin_conversation',
  ARCHIVE_CONVERSATION: 'archive_conversation',
  ADD_LABEL: 'add_label',
  REMOVE_LABEL: 'remove_label',
  CONVERSATION_UPDATED: 'conversation_updated',

  // Message status
  MARK_AS_READ: 'mark_as_read',
};
