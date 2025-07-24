import { REDIS_CHANNEL } from "../../../common/enum/redis/redis.enum.js";
import { EVENTS } from "../../../common/enum/socket/socket.enum.js";
import { emitToRoom } from "../../socket/index.js";
import { subscribe } from "../redis.js";

export function registerReactionListener() {
  subscribe(REDIS_CHANNEL.MESSAGE_REACTION, (message) => {
    emitToRoom(message.conversationId, EVENTS.MESSAGE_REACTION, {
      message,
    });
  });

  subscribe(REDIS_CHANNEL.REMOVE_REACTION, (message) => {
    emitToRoom(message.conversationId, EVENTS.REMOVE_REACTION, {
      message,
    });
  });
}
