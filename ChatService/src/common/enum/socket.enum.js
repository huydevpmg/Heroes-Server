export const EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Room management
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

  // Reactions
  MESSAGE_REACTION: 'message_reaction',
  REMOVE_REACTION: 'remove_reaction',

  // Status
  USER_STATUS_CHANGE: 'user_status_change',

  // Group/Conversation management
  GROUP_CREATED: 'group_created',
  NEW_GROUP: 'new_group',
  PIN_CONVERSATION: 'pin_conversation',
  ARCHIVE_CONVERSATION: 'archive_conversation',
  ADD_LABEL: 'add_label',
  REMOVE_LABEL: 'remove_label',
  USER_JOINED_CONVERSATION: 'user_joined_conversation',

  // Message status
  MARK_AS_READ: 'mark_as_read',

  // Attachments
  ATTACHMENT_CREATED: 'attachment_created',
  ATTACHMENT_DELETED: 'attachment_deleted',
};
