import { REDIS_CHANNEL } from "../../../common/enum/redis/redis.enum.js";
import { EVENTS } from "../../../common/enum/socket/socket.enum.js";
import { emitToRoom } from "../../socket/index.js";
import { subscribe } from "../redis.js";

export function registerAttachmentListener() {
  subscribe(REDIS_CHANNEL.ATTACHMENT_CREATED, (attachment) => {
    emitToRoom(attachment.conversationId, EVENTS.ATTACHMENT_CREATED, {
      attachment,
      conversationId: attachment.conversationId,
    });
  });
}