import mongoose from "mongoose";
import MessageReadReceipt from "./messageReadReceipt.model.js";

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
                "USER_ADDED",
                "USER_LEAVE",
                "USER_REMOVED"
            ],
            required: false
        },
        meta: {
            type: Object,
            required: false
        }
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    }
);

messageSchema.post('save', async function(doc) {
    try {
        // skip system messages without sender
        if (!doc.senderId) {
            return;
        }

        const existingReceipt = await MessageReadReceipt.findOne({
            messageId: doc._id,
            userId: doc.senderId
        });

        if (!existingReceipt) {
            await MessageReadReceipt.create({
                messageId: doc._id,
                userId: doc.senderId,
                conversationId: doc.conversationId,
                readAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error creating auto read receipt for sender:', error);
    }
});

export default mongoose.model("Message", messageSchema);