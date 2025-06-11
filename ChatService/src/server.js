import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import connectDB from './db/mongo.js';
import { initSocket } from './lib/socket.js';
import conversationRoutes from './routes/conversation.route.js';
import messsageRoutes from './routes/message.route.js';
import { setupSwagger } from './swagger/swagger.js';

dotenv.config();

const PORT = process.env.AUTH_PORT || process.env.PORT || 5000;
if (!PORT) {
  throw new Error('PORT is not defined in the environment variables');
}

const app = express();
const server = http.createServer(app);

// Middleware 
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:4200', 'http://localhost:43879'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Setup Swagger
setupSwagger(app);

// Routes
app.use('/api/messages', messsageRoutes);
app.use('/api/conversation', conversationRoutes);

// Start server and connect DB
server.listen(PORT, async () => {
  console.log(`Server is running on PORT: ${PORT}`);
  try {
    await connectDB();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  // Initialize Socket.IO
  initSocket(server);
  console.log('Socket.IO initialized');
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
