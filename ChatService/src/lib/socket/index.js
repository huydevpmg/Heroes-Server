import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import { registerUserSocket } from "./user.socket.js";
import { registerConversationSocket } from "./conversation.socket.js";
import { socketAuth } from "../../middleware/socketAuth.js";
import ConversationService from "../../services/conversation.service.js";
import MessageService from "../../services/message.service.js";
import UserConversationService from "../../services/userConversation.service.js";
import { pubClient, subClient } from "../redis/redis.js";

let io;
const onlineUsers = {};

export const initSocket = async (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:4200", "http://localhost:43879"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type"],
    },
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.use(socketAuth);
  io.setMaxListeners(10000);

  const services = {
    conversationService: new ConversationService(),
    messageService: new MessageService(),
    userConversationService: new UserConversationService(),
  };

  io.on("connection", (socket) => {
    registerUserSocket(io, socket, onlineUsers);
    registerConversationSocket(socket);
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
  console.log('[Socket Emit] Room:', roomId, 'Event:', event, 'Data:', JSON.stringify(data));
  getIO().to(roomId).emit(event, data);
};

export const emitToUser = (userId, event, data) => {
  console.log('[Socket Emit] User:', userId, 'Event:', event, 'Data:', JSON.stringify(data));
  getIO().to(userId).emit(event, data);
};
