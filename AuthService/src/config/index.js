import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URI,
  authServiceUrl: process.env.AUTH_SERVICE_URL,
  heroServiceUrl: process.env.HERO_SERVICE_URL,
  redisUrl: process.env.REDIS_URL,
};
