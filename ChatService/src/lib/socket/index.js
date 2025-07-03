import { Server } from "socket.io";

import { registerUserSocket } from "./user.socket.js";
import { registerConversationSocket } from "./conversation.socket.js";
import { registerMessageSocket } from "./message.socket.js";
import { registerAttachmentSocket } from "./attachment.socket.js";
import { registerReadReceiptSocket } from "./readReceipt.socket.js";
import { socketAuth } from "../../middleware/socketAuth.js";
import ConversationService from "../../services/conversation.service.js";
import MessageService from "../../services/message.service.js";
import UserConversationService from "../../services/userConversation.service.js";

let io;
const onlineUsers = {};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:4200", "http://localhost:43879"],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Authorization"],
    },
  });

  io.use(socketAuth);
  io.setMaxListeners(10000);

  const services = {
    conversationService: new ConversationService(),
    messageService: new MessageService(),
    userConversationService: new UserConversationService(),
  };

  io.on("connection", (socket) => {
    registerUserSocket(io, socket, onlineUsers);
    registerConversationSocket(io, socket, services);
    registerMessageSocket(io, socket, services);
    registerAttachmentSocket(io, socket);
    registerReadReceiptSocket(socket);
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

export const emitToRoom = (roomId, event, data) => {
  getIO().to(roomId).emit(event, data);
};

export const emitToUser = (userId, event, data) => {
  getIO().to(userId).emit(event, data);
};