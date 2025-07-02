import { EVENTS } from "../../common/enum/socket.enum.js";
import { MessageDeleteType } from "../../common/enum/message-delete-type.enum.js";

export const registerMessageSocket = (io, socket, services) => {
  const { messageService, userConversationService } = services;

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

  socket.on(EVENTS.EDIT_MESSAGE, async ({ messageId, content }, callback) => {
    try {
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

  socket.on(EVENTS.DELETE_MESSAGE, async ({ messageId, deleteType }, callback) => {
    try {
      const validTypes = Object.values(MessageDeleteType);
      if (!deleteType || !validTypes.includes(deleteType)) {
        return callback && callback({ success: false, message: `Invalid delete type` });
      }
      let message;
      if (deleteType === MessageDeleteType.EVERYONE) {
        message = await messageService.deleteMessageForEveryone(messageId);
        if (message) {
          io.to(message.conversationId).emit(EVENTS.MESSAGE_DELETED_GLOBAL, {
            messageId,
            conversationId: message.conversationId,
          });
        }
      } else {
        message = await messageService.deleteMessageForUser(messageId, socket.userId);
        if (message) {
          socket.emit(EVENTS.MESSAGE_DELETED_PERSONAL, {
            messageId,
            userId: socket.userId,
            conversationId: message.conversationId,
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

  socket.on(EVENTS.MESSAGE_REACTION, async ({ messageId, emoji }, callback) => {
    try {
      const message = await messageService.addReaction(messageId, socket.userId, emoji);
      io.to(message.conversationId).emit(EVENTS.MESSAGE_REACTION, { messageId, userId: socket.userId, emoji });
      callback && callback({ success: true, message });
    } catch (err) {
      callback && callback({ success: false, message: err.message });
    }
  });

  socket.on(EVENTS.REMOVE_REACTION, async ({ messageId }, callback) => {
    try {
      const message = await messageService.removeReaction(messageId, socket.userId);
      io.to(message.conversationId).emit(EVENTS.REMOVE_REACTION, { messageId, userId: socket.userId });
      callback && callback({ success: true, message });
    } catch (err) {
      callback && callback({ success: false, message: err.message });
    }
  });

  socket.on(EVENTS.MARK_AS_READ, async ({ conversationId, messageId }, callback) => {
    try {
      const result = await userConversationService.markAsRead(conversationId, socket.userId, messageId);
      callback && callback({ success: true, result });
    } catch (err) {
      callback && callback({ success: false, message: err.message });
    }
  });
};