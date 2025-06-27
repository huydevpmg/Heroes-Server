import { EVENTS } from '../../common/enum/socket.enum.js';

export const registerAttachmentSocket = (socket) => {
  socket.on(EVENTS.ATTACHMENT_CREATED, (data) => {
    const { conversationId, attachment } = data;
    socket.to(conversationId).emit(EVENTS.ATTACHMENT_CREATED, { attachment });
  });

  socket.on(EVENTS.ATTACHMENT_DELETED, (data) => {
    const { conversationId, attachmentId } = data;
    socket.to(conversationId).emit(EVENTS.ATTACHMENT_DELETED, { attachmentId });
  });
};