import { EVENTS } from '../../common/enum/socket.enum.js';

export const registerConversationSocket = (io, socket, services) => {
  const { conversationService, userConversationService } = services;

  socket.on(EVENTS.JOIN_ROOM, (conversationId) => {
    const roomId = conversationId.toString();
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room ${roomId}`);
    socket.to(roomId).emit(EVENTS.USER_JOINED_CONVERSATION, {
      userId: socket.userId,
      conversationId: roomId,
    });
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

  socket.on(EVENTS.GROUP_CREATED, (groupData) => {
    groupData.participants.forEach((memberId) => {
      io.to(memberId).emit(EVENTS.NEW_GROUP, groupData);
    });
  });

  socket.on(EVENTS.PIN_CONVERSATION, async ({ conversationId }, callback) => {
    try {
      const result = await userConversationService.togglePin(conversationId, socket.userId);
      callback && callback({ success: true, result });
    } catch (err) {
      callback && callback({ success: false, message: err.message });
    }
  });

  socket.on(EVENTS.ARCHIVE_CONVERSATION, async ({ conversationId }, callback) => {
    try {
      const result = await userConversationService.toggleArchive(conversationId, socket.userId);
      callback && callback({ success: true, result });
    } catch (err) {
      callback && callback({ success: false, message: err.message });
    }
  });

  socket.on(EVENTS.ADD_LABEL, async ({ conversationId, label }, callback) => {
    try {
      const result = await userConversationService.addLabel(conversationId, socket.userId, label);
      callback && callback({ success: true, result });
    } catch (err) {
      callback && callback({ success: false, message: err.message });
    }
  });

  socket.on(EVENTS.REMOVE_LABEL, async ({ conversationId, label }, callback) => {
    try {
      const result = await userConversationService.removeLabel(conversationId, socket.userId, label);
      callback && callback({ success: true, result });
    } catch (err) {
      callback && callback({ success: false, message: err.message });
    }
  });
};