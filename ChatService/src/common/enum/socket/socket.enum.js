export const EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Room management events
  JOIN_ROOM: 'join_room',
  CONNECT_CONVERSATION: 'connect_conversation',

  // Message events
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  EDIT_MESSAGE: 'edit_message',
  DELETE_MESSAGE: 'delete_message',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED_GLOBAL: 'message_deleted_global',
  MESSAGE_DELETED_PERSONAL: 'message_deleted_personal',

  // Typing indicators
  TYPING: 'typing',
  USER_TYPING: 'user_typing',

  // Reaction events
  MESSAGE_REACTION: 'message_reaction',
  REMOVE_REACTION: 'remove_reaction',

  // User status events
  USER_STATUS_CHANGE: 'user_status_change',

  // Group/Conversation management events
  GROUP_CREATED: 'group_created',
  NEW_GROUP: 'new_group',
  PIN_CONVERSATION: 'pin_conversation',
  ARCHIVE_CONVERSATION: 'archive_conversation',
  ADD_LABEL: 'add_label',
  REMOVE_LABEL: 'remove_label',
  USER_JOINED_CONVERSATION: 'user_joined_conversation',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  LEAVE_GROUP_NOTIFY: 'user_left_group_notify',
  LEAVE_GROUP_: 'leave_group',
  
  // Message status events
  MARK_AS_READ: 'mark_as_read',
  READ_RECEIPT_UPDATED: 'read_receipt_updated',

  // Attachment events
  ATTACHMENT_CREATED: 'attachment_created',
  ATTACHMENT_DELETED: 'attachment_deleted'
};