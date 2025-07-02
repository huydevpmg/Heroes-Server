import ReadReceiptService from '../../services/readReceipt.service.js';
import { EVENTS } from './events.enum.js';

const readReceiptService = new ReadReceiptService();

export const registerReadReceiptSocket = (socket) => {

  // Handle marking message as read via socket
  socket.on(EVENTS.MESSAGE_READ, async (data) => {
    try {
      const { messageId, userId, conversationId } = data;

      if (!messageId || !userId || !conversationId) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Mark message as read
      const readReceipt = await readReceiptService.markMessageAsRead(
        messageId,
        userId,
        conversationId
      );

      socket.to(conversationId).emit(EVENTS.READ_RECEIPT_UPDATED, {
        messageId,
        userId,
        readAt: readReceipt.readAt,
        conversationId,
        user: readReceipt.user,
        type: 'single'
      });

    } catch (error) {
      console.error('Error in MESSAGE_READ socket handler:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on(EVENTS.BULK_MESSAGE_READ, async (data) => {
    try {
      const { messageIds, userId, conversationId } = data;
      if (!messageIds || !Array.isArray(messageIds) || !userId || !conversationId) {
        socket.emit('error', { message: 'Missing required fields or invalid messageIds' });
        return;
      }
      // Mark messages as read
      const result = await readReceiptService.markMultipleMessagesAsRead(
        messageIds,
        userId,
        conversationId
      );

      const userData = await readReceiptService.getUserData(userId);

      // Emit to all users in the conversation (including sender)
      const eventData = {
        messageIds,
        userId,
        readAt: new Date(),
        conversationId,
        user: userData,
        type: 'bulk'
      };
      socket.to(conversationId).emit(EVENTS.READ_RECEIPT_UPDATED, eventData);
      socket.emit(EVENTS.READ_RECEIPT_UPDATED, eventData);
    } catch (error) {
      console.error('Error in BULK_MESSAGE_READ socket handler:', error);
      socket.emit('error', { message: error.message });
    }
  });
};