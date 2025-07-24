import { createClient } from 'redis';
import { config } from '../../config/index.js';

const redisUrl = config.redisUrl || 'redis://redis:6379';

// Global redis client
const redisClient = createClient({ url: redisUrl });
const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

// Log connection status
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
pubClient.on('error', (err) => console.error('Redis Pub Error:', err));
subClient.on('error', (err) => console.error('Redis Sub Error:', err));

redisClient.on('ready', () => console.log('Redis ready'));
pubClient.on('ready', () => console.log('Redis Pub ready'));
subClient.on('ready', () => console.log('Redis Sub ready'));

// Connect all clients
export const connectRedis = async () => {
  if (!redisClient.isOpen) {await redisClient.connect();}
  if (!pubClient.isOpen) {await pubClient.connect();}
  if (!subClient.isOpen) {await subClient.connect();}

  console.log('All Redis clients connected');
};

// Publish helper
export const publish = async (channel, message) => {
  const payload = typeof message === 'string' ? message : JSON.stringify(message);
  return pubClient.publish(channel, payload);
};

// Subscribe helper
export const subscribe = async (channel, callback) => {
  await subClient.subscribe(channel, (message) => {
    try {
      callback(JSON.parse(message));
    } catch (e) {
      console.error('Redis subscribe JSON parse error:', e, 'Message:', message);
    }
  });
};

export const getRedisClient = () => redisClient;

export { redisClient, pubClient, subClient };
