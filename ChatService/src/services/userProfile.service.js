import axios from "axios";
import { config } from "../config/index.js";
import { redisClient } from "../lib/redis/redis.js";
import { REDIS_CACHE_KEY } from "../common/enum/redis/redis.enum.js";

class UserProfileService {
  constructor() {
    this.authServiceUrl = config.authServiceUrl || "http://localhost:4000/api";
  }

  async getUser(userId) {
    const cacheKey = REDIS_CACHE_KEY.USER_PROFILE(userId);
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`[UserProfileService] Cache HIT: ${cacheKey}`);
      return JSON.parse(cached);
    }
    try {
      const { data } = await axios.get(`${this.authServiceUrl}/profile/${userId}`);
      await redisClient.set(cacheKey, JSON.stringify(data), { EX: 600 });
      return data;
    } catch (e) {
      console.error(`[UserProfileService] Error fetching user ${userId}:`, e.message);
      return null;
    }
  }

  async getUsers(userIds = []) {
    return Promise.all(userIds.map((uid) => this.getUser(uid)));
  }

  async getAllUsers() {
    const cacheKey = REDIS_CACHE_KEY.ALL_USERS;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`[UserProfileService] Cache HIT: ${cacheKey}`);
      return JSON.parse(cached);
    }
    try {
      const { data } = await axios.get(`${this.authServiceUrl}/profile`);
      await redisClient.set(cacheKey, JSON.stringify(data), { EX: 600 });
      return data;
    } catch (e) {
      console.error(`[UserProfileService] Error fetching all users:`, e.message);
      throw new Error("Error fetching users");
    }
  }
}

export default new UserProfileService();