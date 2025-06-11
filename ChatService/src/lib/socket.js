import { Server } from 'socket.io';
import { socketAuth } from '../middleware/socketAuth.js';

let io;
let onlineUsers = {};  // Quản lý trạng thái online/offline
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
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:4200', 'http://localhost:43879'],
      methods: ['GET', 'POST'],
      // credentials: true,
    },
  });

  io.use(socketAuth);  

  io.on(EVENTS.CONNECTION, (socket) => {
    console.log(`User connected: ${socket.id}, userId: ${socket.userId}`);
    onlineUsers[socket.userId] = 'online';
    io.emit(EVENTS.USER_STATUS_CHANGE, { userId: socket.userId, status: 'online' });
    
    socket.on(EVENTS.CONNECT_CONVERSATION,  async ({partnerId}, callback) => {
      const conversation = await findOrCreate1on1Conversation(socket.userId, partnerId);
      if (conversation) {
        socket.join(conversation._id.toString());
        console.log(`User ${socket.userId} joined conversation: ${conversation._id}`);
        callback && callback({ success: true, conversationId: conversation._id.toString() });
      } else {
        console.error('Failed to find or create conversation');
      }

    });

    socket.on(EVENTS.JOIN_ROOM, (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined room: ${conversationId}`);
    });

    socket.on(EVENTS.SEND_MESSAGE, async (data, callback) => {
      const { conversationId, content } = data;
      if (!conversationId || !content) {
        return callback && callback({ success: false, message: 'Invalid data' });
      }

      const messageData = await sendMessage({
        conversationId,
        senderId: socket.userId,
        content,
      }); 
      socket.to(messageData.roomId).emit(EVENTS.RECEIVE_MESSAGE, messageData);
    });

    socket.on(EVENTS.TYPING, (data) => {
      socket.to(data.roomId).emit(EVENTS.USER_TYPING, {
        userId: socket.userId,
        username: socket.username,
        isTyping: data.isTyping,
      });
    });

    socket.on(EVENTS.GROUP_CREATED, (groupData) => {
      groupData.members.forEach((memberId) => {
        io.to(memberId).emit(EVENTS.NEW_GROUP, groupData);
      });
    });

    socket.on(EVENTS.DISCONNECT, () => {
      console.log(`User disconnected: ${socket.id}`);
      onlineUsers[socket.userId] = 'offline';
      io.emit(EVENTS.USER_STATUS_CHANGE, { userId: socket.userId, status: 'offline' });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitToRoom = (roomId, event, data) => {
  getIO().to(roomId).emit(event, data);
};

export const emitToUser = (userId, event, data) => {
  getIO().to(userId).emit(event, data);
};
