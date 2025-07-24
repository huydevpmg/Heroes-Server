import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './db/mongo.js';
import { initSocket } from './lib/socket/index.js';
import routes from './routes/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { registerRedisSubscribers } from './lib/redis/listener/index.js';
import { connectRedis } from './lib/redis/redis.js';


dotenv.config();

const app = express();

const httpServer = createServer(app);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chat Service API',
      version: '1.0.0',
      description: 'API documentation for Chat Service',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/swagger/*.swagger.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(cors({
  origin: [
    "http://localhost:4200",
    "http://localhost:8080",
    "http://127.0.0.1:4200",
    "http://host.docker.internal:4200"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  // credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
initSocket(httpServer);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});
// Redis

// Connect to MongoDB
connectDB()
  .then(async () => {
    await connectRedis();
    registerRedisSubscribers();
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  httpServer.close(() => process.exit(1));
});
