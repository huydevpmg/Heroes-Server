import { EVENTS } from "../../common/enum/socket/socket.enum.js";

export const registerUserSocket = (io, socket, onlineUsers) => {
  socket.join(socket.userId);

  if (!onlineUsers[socket.userId]) {
    onlineUsers[socket.userId] = new Set();
  }
  onlineUsers[socket.userId].add(socket.id);
  if (onlineUsers[socket.userId].size === 1) {
    io.emit(EVENTS.USER_STATUS_CHANGE, { userId: socket.userId, status: 'online' });
  }

  socket.emit(EVENTS.USER_STATUS_CHANGE, { onlineUsers: Object.keys(onlineUsers) });

  socket.on(EVENTS.DISCONNECT, () => {
    if (onlineUsers[socket.userId]) {
      onlineUsers[socket.userId].delete(socket.id);
      if (onlineUsers[socket.userId].size === 0) {
        delete onlineUsers[socket.userId];
        io.emit(EVENTS.USER_STATUS_CHANGE, { userId: socket.userId, status: 'offline' });
      }
    }
  });

  socket.on('error', (error) => {
    console.error(`Socket error for user ${socket.userId}:`, error);
  });
};