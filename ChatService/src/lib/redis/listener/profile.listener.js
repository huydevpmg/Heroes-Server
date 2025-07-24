import { REDIS_CACHE_KEY, REDIS_CACHE_TYPE, REDIS_CHANNEL} from "../../../common/enum/redis/redis.enum.js";
import { subscribe } from "../redis.js";
import { invalidateAndUpdateCache } from "../helpers/cache.helper.js";

export function registerProfileListener() {
  subscribe(REDIS_CHANNEL.USER_PROFILE_UPDATED, async (data) => {
    const user = data.user;
    if (!user || !user._id) {
      return;
    }
    await invalidateAndUpdateCache(
      REDIS_CACHE_KEY.USER_PROFILE(user._id),
      REDIS_CACHE_TYPE.STRING,
      null,
      user
    );
  });
}
