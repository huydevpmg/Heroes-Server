import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  mongoUrl: process.env.MONGO_URL || process.env.MONGO_URI || process.env.MONGO_URI_DOCKER,
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:4000/api',
  heroServiceUrl: process.env.HERO_SERVICE_URL || 'http://localhost:5000/api',
  keyFilename: process.env.KEY_FILENAME,
  projectId: process.env.PROJECT_ID,
  bucketName: process.env.BUCKET_NAME,
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
  redisHost: process.env.REDIS_HOST || 'redis',
  redisPort: process.env.REDIS_PORT || 6379,
};