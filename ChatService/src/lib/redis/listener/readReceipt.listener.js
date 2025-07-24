import { subscribe } from "../redis.js";
import { REDIS_CHANNEL } from "../../../common/enum/redis/redis.enum.js";
import { EVENTS } from "../../../common/enum/socket/socket.enum.js";
import { emitToRoom } from "../../socket/index.js";

export function registerReadReceiptListener() {
  subscribe(REDIS_CHANNEL.READ_RECEIPT, (payload) => {
    emitToRoom(payload.conversationId, EVENTS.READ_RECEIPT_UPDATED, payload);
  });
}