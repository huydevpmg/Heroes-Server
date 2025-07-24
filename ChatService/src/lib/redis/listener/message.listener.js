import { REDIS_CHANNEL } from "../../../common/enum/redis/redis.enum.js";
import { EVENTS } from "../../../common/enum/socket/socket.enum.js";
import { emitToRoom, getIO } from "../../socket/index.js";
import { subscribe } from "../redis.js";

export function registerMessageListener() {
  subscribe(REDIS_CHANNEL.CHAT_MESSAGE, (data) => {
    const { conversationId, message } = data;
    emitToRoom(conversationId, EVENTS.RECEIVE_MESSAGE, message);
  });

  subscribe(REDIS_CHANNEL.MESSAGE_UPDATED, (message) => {
    console.log('Message updated:', message);
    emitToRoom(
      message.conversationId.toString(),
      EVENTS.MESSAGE_UPDATED,
      message
    );
  });

  subscribe(REDIS_CHANNEL.MESSAGE_DELETED, ({ message, affectedReplies }) => {
    emitToRoom(
      message.conversationId.toString(),
      EVENTS.MESSAGE_DELETED_GLOBAL,
      {
        messageId: message._id,
        conversationId: message.conversationId.toString(),
        affectedReplies,
      }
    );
  });
}
