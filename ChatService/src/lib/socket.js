import { Server } from 'socket.io';
import { socketAuth } from '../middleware/socketAuth.js';
import ConversationService from '../services/conversation.service.js';
import MessageService from '../services/message.service.js';
import UserConversationService from '../services/userConversation.service.js';

let io;
const onlineUsers = {}; // { [userId]: Set([socketId, ...]) }

const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  SEND_MESSAGE: 'send_message',
  TYPING: 'typing',
  GROUP_CREATED: 'group_created',
  RECEIVE_MESSAGE: 'receive_message',
  USER_TYPING: 'user_typing',
  NEW_GROUP: 'new_group',
  USER_STATUS_CHANGE: 'user_status_change',
  CONNECT_CONVERSATION: 'connect_conversation',
  MESSAGE_REACTION: 'message_reaction',
  REMOVE_REACTION: 'remove_reaction',
  MARK_AS_READ: 'mark_as_read',
  PIN_CONVERSATION: 'pin_conversation',
  ARCHIVE_CONVERSATION: 'archive_conversation',
  ADD_LABEL: 'add_label',
  REMOVE_LABEL: 'remove_label',
  USER_JOINED_CONVERSATION: 'user_joined_conversation',

  EDIT_MESSAGE: 'edit_message',
  DELETE_MESSAGE: 'delete_message',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED_GLOBAL: 'message_deleted_global',
  MESSAGE_DELETED_PERSONAL: 'message_deleted_personal',

  // Attachment events
  ATTACHMENT_CREATED: 'attachment_created',
  ATTACHMENT_DELETED: 'attachment_deleted',
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:4200', 'http://localhost:43879'],
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Authorization'],
    },
  });

  io.use(socketAuth);

  const conversationService = new ConversationService();
  const messageService = new MessageService();
  const userConversationService = new UserConversationService();

  io.on(EVENTS.CONNECTION, (socket) => {
    socket.join(socket.userId);

    if (!onlineUsers[socket.userId]) {
      onlineUsers[socket.userId] = new Set();
    }
    onlineUsers[socket.userId].add(socket.id);
    if (onlineUsers[socket.userId].size === 1) {
      io.emit(EVENTS.USER_STATUS_CHANGE, { userId: socket.userId, status: 'online' });
    }

    socket.emit(EVENTS.USER_STATUS_CHANGE, { onlineUsers: Object.keys(onlineUsers) });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });

    socket.on('disconnect', (reason) => {
      if (onlineUsers[socket.userId]) {
        onlineUsers[socket.userId].delete(socket.id);
        if (onlineUsers[socket.userId].size === 0) {
          delete onlineUsers[socket.userId];
          io.emit(EVENTS.USER_STATUS_CHANGE, { userId: socket.userId, status: 'offline' });
        }
      }
    });

    socket.on(EVENTS.CONNECT_CONVERSATION, async ({ partnerId }, callback) => {
      try {
        const conversation = await conversationService.findOrCreate1on1Conversation(socket.userId, partnerId);
        if (conversation) {
          socket.join(conversation._id.toString());
          callback && callback({ success: true, conversationId: conversation._id.toString() });
        } else {
          callback && callback({ success: false, message: 'Failed to find or create conversation' });
        }
      } catch (err) {
        callback && callback({ success: false, message: err.message });
      }
    });

    socket.on(EVENTS.JOIN_ROOM, (conversationId) => {
      socket.join(conversationId);
      socket.to(conversationId).emit(EVENTS.USER_JOINED_CONVERSATION, {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on(EVENTS.SEND_MESSAGE, async (data, callback) => {
      try {
        const { conversationId, content, parentMessage, heroContext, attachmentId } = data;
        if (!conversationId || !content) {
          return callback && callback({ success: false, message: 'Invalid data' });
        }
        const message = await messageService.createMessage({
          conversationId,
          senderId: socket.userId,
          content,
          parentMessage,
          heroContext,
          attachmentId,
        });
        io.to(conversationId).emit(EVENTS.RECEIVE_MESSAGE, message);
        callback && callback({ success: true, message });
      } catch (error) {
        callback && callback({ success: false, message: 'Failed to create message', error: error.message });
      }
    });

    socket.on(EVENTS.TYPING, (data) => {
      socket.to(data.conversationId).emit(EVENTS.USER_TYPING, {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on(EVENTS.MESSAGE_REACTION, async (data, callback) => {
      try {
        const { messageId, emoji } = data;
        const message = await messageService.addReaction(messageId, socket.userId, emoji);
        io.to(message.conversationId).emit(EVENTS.MESSAGE_REACTION, { messageId, userId: socket.userId, emoji });
        callback && callback({ success: true, message });
      } catch (err) {
        callback && callback({ success: false, message: err.message });
      }
    });

    socket.on(EVENTS.REMOVE_REACTION, async (data, callback) => {
      try {
        const { messageId } = data;
        const message = await messageService.removeReaction(messageId, socket.userId);
        io.to(message.conversationId).emit(EVENTS.REMOVE_REACTION, { messageId, userId: socket.userId });
        callback && callback({ success: true, message });
      } catch (err) {
        callback && callback({ success: false, message: err.message });
      }
    });

    socket.on(EVENTS.MARK_AS_READ, async (data, callback) => {
      try {
        const { conversationId, messageId } = data;
        const result = await userConversationService.markAsRead(conversationId, socket.userId, messageId);
        callback && callback({ success: true, result });
      } catch (err) {
        callback && callback({ success: false, message: err.message });
      }
    });

    socket.on(EVENTS.PIN_CONVERSATION, async (data, callback) => {
      try {
        const { conversationId } = data;
        const result = await userConversationService.togglePin(conversationId, socket.userId);
        callback && callback({ success: true, result });
      } catch (err) {
        callback && callback({ success: false, message: err.message });
      }
    });

    socket.on(EVENTS.ARCHIVE_CONVERSATION, async (data, callback) => {
      try {
        const { conversationId } = data;
        const result = await userConversationService.toggleArchive(conversationId, socket.userId);
        callback && callback({ success: true, result });
      } catch (err) {
        callback && callback({ success: false, message: err.message });
      }
    });

    socket.on(EVENTS.ADD_LABEL, async (data, callback) => {
      try {
        const { conversationId, label } = data;
        const result = await userConversationService.addLabel(conversationId, socket.userId, label);
        callback && callback({ success: true, result });
      } catch (err) {
        callback && callback({ success: false, message: err.message });
      }
    });

    socket.on(EVENTS.REMOVE_LABEL, async (data, callback) => {
      try {
        const { conversationId, label } = data;
        const result = await userConversationService.removeLabel(conversationId, socket.userId, label);
        callback && callback({ success: true, result });
      } catch (err) {
        callback && callback({ success: false, message: err.message });
      }
    });

    socket.on(EVENTS.GROUP_CREATED, (groupData) => {
      groupData.participants.forEach((memberId) => {
        io.to(memberId).emit(EVENTS.NEW_GROUP, groupData);
      });
    });

    // Edit message event
    socket.on(EVENTS.EDIT_MESSAGE, async (data, callback) => {
      try {
        const { messageId, content } = data;
        if (!content || !content.trim()) {
          return callback && callback({ success: false, message: 'Content is required' });
        }
        
        const message = await messageService.updateMessage(messageId, content.trim());
        if (!message) {
          return callback && callback({ success: false, message: 'Message not found' });
        }
        
        io.to(message.conversationId).emit(EVENTS.MESSAGE_UPDATED, message);
        callback && callback({ success: true, message });
      } catch (err) {
        callback && callback({ success: false, message: err.message });
      }
    });

    // Delete message event
    socket.on(EVENTS.DELETE_MESSAGE, async (data, callback) => {
      try {
        const { messageId, deleteType } = data;
        
        if (!deleteType || !['everyone', 'justme'].includes(deleteType)) {
          return callback && callback({ success: false, message: 'Invalid delete type' });
        }
        
        let message;
        if (deleteType === 'everyone') {
          message = await messageService.deleteMessageForEveryone(messageId);
          if (message) {
            // Emit to all users in the conversation
            io.to(message.conversationId).emit(EVENTS.MESSAGE_DELETED_GLOBAL, {
              messageId,
              conversationId: message.conversationId
            });
          }
        } else {
          message = await messageService.deleteMessageForUser(messageId, socket.userId);
          if (message) {
            // Emit only to the specific user
            socket.emit(EVENTS.MESSAGE_DELETED_PERSONAL, {
              messageId,
              userId: socket.userId,
              conversationId: message.conversationId
            });
          }
        }
        
        if (!message) {
          return callback && callback({ success: false, message: 'Message not found' });
        }
        
        callback && callback({ success: true, message: 'Message deleted successfully' });
      } catch (err) {
        callback && callback({ success: false, message: err.message });
      }
    });

    socket.on(EVENTS.ATTACHMENT_CREATED, (data) => {
      const { conversationId, attachment } = data;
      socket.to(conversationId).emit(EVENTS.ATTACHMENT_CREATED, { attachment });
    });

    socket.on(EVENTS.ATTACHMENT_DELETED, (data) => {
      const { conversationId, attachmentId } = data;
      socket.to(conversationId).emit(EVENTS.ATTACHMENT_DELETED, { attachmentId });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export const emitToRoom = (roomId, event, data) => {
  getIO().to(roomId).emit(event, data);
};

export const emitToUser = (userId, event, data) => {
  getIO().to(userId).emit(event, data);
};