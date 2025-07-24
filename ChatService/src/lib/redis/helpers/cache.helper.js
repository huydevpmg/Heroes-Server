import { redisClient } from "../redis.js";
import { REDIS_CACHE_TYPE } from "../../../common/enum/redis/redis.enum.js";

/**
 * Invalidate old cache and update new cache for Redis data types
 * @param {string} pattern - key or field to invalidate/update
 * @param {string} type - cache type (string, hash, set, list)
 * @param {string|null} hashKey - key of hash/set/list if needed
 * @param {any} newValue - new value to update cache (optional)
 */
export async function invalidateAndUpdateCache(
  pattern,
  type = REDIS_CACHE_TYPE.STRING,
  hashKey = null,
  newValue = null
) {
  try {
    switch (type) {
      case REDIS_CACHE_TYPE.STRING: {
        const keys = await redisClient.keys(pattern);
        if (keys.length) {
          await redisClient.del(keys);
          console.log(`[Redis] String cache invalidated for pattern: ${pattern}`);
        }
        if (newValue !== null) {
          await redisClient.set(pattern, JSON.stringify(newValue), { EX: 600 });
          console.log(`[Redis] String cache updated for key: ${pattern}`);
        }
        break;
      }
      case REDIS_CACHE_TYPE.HASH: {
        if (!hashKey) {
          throw new Error("Missing hashKey for hash type");
        }
        await redisClient.hDel(hashKey, pattern);
        console.log(
          `[Redis] Hash cache invalidated for hash: ${hashKey}, field: ${pattern}`
        );
        if (newValue !== null) {
          await redisClient.hSet(hashKey, pattern, JSON.stringify(newValue));
          console.log(
            `[Redis] Hash cache updated for hash: ${hashKey}, field: ${pattern}`
          );
        }
        break;
      }
      case REDIS_CACHE_TYPE.SET: {
        if (!hashKey) {
          throw new Error("Missing set key for set type");
        }
        await redisClient.sRem(hashKey, pattern);
        console.log(
          `[Redis] Set cache invalidated for set: ${hashKey}, member: ${pattern}`
        );
        if (newValue !== null) {
          await redisClient.sAdd(hashKey, newValue);
          console.log(
            `[Redis] Set cache updated for set: ${hashKey}, member: ${newValue}`
          );
        }
        break;
      }
      case REDIS_CACHE_TYPE.LIST: {
        if (!hashKey) {
          throw new Error("Missing list key for list type");
        }
        await redisClient.lRem(hashKey, 0, pattern);
        console.log(
          `[Redis] List cache invalidated for list: ${hashKey}, value: ${pattern}`
        );
        if (newValue !== null) {
          await redisClient.rPush(hashKey, newValue);
          console.log(
            `[Redis] List cache updated for list: ${hashKey}, value: ${newValue}`
          );
        }
        break;
      }
      default:
        throw new Error(`Unknown cache type: ${type}`);
    }
  } catch (error) {
    console.error(
      `[Redis] Error invalidating/updating cache for pattern ${pattern}:`,
      error
    );
  }
}
