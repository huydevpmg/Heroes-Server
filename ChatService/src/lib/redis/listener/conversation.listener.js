import { REDIS_CHANNEL } from "../../../common/enum/redis/redis.enum.js";
import { EVENTS } from "../../../common/enum/socket/socket.enum.js";
import { emitToRoom, emitToUser } from "../../socket/index.js";
import { subscribe } from "../redis.js";

export function registerConversationListener() {
    subscribe(REDIS_CHANNEL.CONVERSATION_CREATED, (conversation) => {
        console.log(`[ConversationListener] New conversation created: ${conversation._id}`);
        conversation.participants.forEach((memberId) => {
            emitToUser(memberId.toString(), EVENTS.GROUP_CREATED, {
                _id: conversation._id.toString(),
                name: conversation.name,
                participants: conversation.participants.map(id => id.toString()),
                isGroup: conversation.isGroup,
                createdBy: conversation.createdBy.toString(),
                createdAt: conversation.createdAt
            });
        });
    });

    subscribe(REDIS_CHANNEL.ADD_MEMBER, (payload) => {
        emitToRoom(payload.conversationId, EVENTS.MEMBER_ADDED, payload);
        payload.addedMembers.forEach((memberId) => {
            emitToUser(memberId.toString(), EVENTS.MEMBER_ADDED, payload);
        });
    });

    subscribe(REDIS_CHANNEL.REMOVE_MEMBER, (payload) => {
        emitToRoom(payload.conversationId, EVENTS.MEMBER_REMOVED, payload);
    });

    subscribe(REDIS_CHANNEL.LEAVE_GROUP, (payload) => {
        console.log(payload)
        emitToRoom(payload.conversationId, EVENTS.RECEIVE_MESSAGE, {
            conversationId: payload.conversationId,
            type: "SYSTEM",
            systemType: "USER_LEAVE",
            content: payload.message,
            meta: {
                userId: payload.userId,
                fullName: payload.fullName
            }
        });
        emitToRoom(payload.conversationId, EVENTS.LEAVE_GROUP_NOTIFY, {
            userId: payload.userId,
            conversationId: payload.conversationId,
        })
        emitToUser(payload.userId.toString(), EVENTS.LEAVE_GROUP_, {
            userId: payload.userId,
            conversationId: payload.conversationId,
        });
    });

}