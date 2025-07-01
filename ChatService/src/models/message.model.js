import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        content: { 
            type: String, 
            required: false
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        status: {
            type: String,
            enum: ["SENT", "DELIVERED", "READ"],
            default: "SENT",
        },
        parentMessage: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Message" 
        },
        heroContext: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
            }
        ],
        attachmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Attachment',
        },
        reactions: [
            {
                userId: { 
                    type: mongoose.Schema.Types.ObjectId 
                },
                emoji: { 
                    type: String 
                },
            }
        ],
        isDeleteGlobal: { 
            type: Boolean, 
            default: false 
        },
        deletedForUserIds: [
            { 
                type: mongoose.Schema.Types.ObjectId 
            }
        ],
        type: {
            type: String,
            enum: ["USER", "SYSTEM"],
            default: "USER"
        },
        systemType: {
            type: String,
            enum: [
                "USER_LEAVE",
                "USER_JOIN",
                "USER_KICK",
                "GROUP_RENAME",
            ],
            required: false
        },
        meta: {
            type: Object,
            required: false
        }
    },
    {
        timestamps: { createdAt: "createAt", updatedAt: "updatedAt" },
    }
);

export default mongoose.model("Message", messageSchema);