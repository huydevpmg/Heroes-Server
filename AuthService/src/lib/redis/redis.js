import { createClient } from 'redis';
import { config } from '../../config/index.js';

const redisUrl = config.redisUrl || 'redis://redis:6379';

// Global redis client
const redisClient = createClient({ url: redisUrl });
const pubClient = createClient({ url: redisUrl });
const subClient = createClient({ url: redisUrl });

// Log connection status
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
pubClient.on('error', (err) => console.error('Redis Pub Error:', err));
subClient.on('error', (err) => console.error('Redis Sub Error:', err));

redisClient.on('ready', () => console.log('✅ Redis ready'));
pubClient.on('ready', () => console.log('✅ Redis Pub ready'));
subClient.on('ready', () => console.log('✅ Redis Sub ready'));

// Connect all clients
export const connectRedis = async () => {
  await Promise.all([
    redisClient.connect(),
    pubClient.connect(),
    subClient.connect(),
  ]);
  console.log('✅ All Redis clients connected');
};

// Publish helper
export const publish = async (channel, message) => {
  return pubClient.publish(channel, typeof message === 'string' ? message : JSON.stringify(message));
};

// Subscribe helper
export const subscribe = async (channel, callback) => {
  await subClient.subscribe(channel, (message) => {
    callback(JSON.parse(message));
  });
};

// Export single redis client if needed
export const getRedisClient = () => redisClient;

export default {
  redisClient,
  pubClient,
  subClient,
  connectRedis,
  publish,
  subscribe,
};