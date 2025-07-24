import { EVENTS } from '../../common/enum/socket/socket.enum.js';

export const registerConversationSocket = (socket) => {
  socket.on(EVENTS.JOIN_ROOM, (conversationId) => {
    const roomId = conversationId.toString();
    socket.join(roomId);
  });
};