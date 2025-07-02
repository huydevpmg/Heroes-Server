import mongoose from "mongoose";
import './messageReadReceipt.model.js';
import MessageReadReceipt from "./messageReadReceipt.model.js";

const messageSchema = new mongoose.Schema(
    {
        content: { 
            type: String, 
            required: false
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
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
    },
    {
        timestamps: { createdAt: "createAt", updatedAt: "updatedAt" },
    }
);

messageSchema.post('save', async function(doc) {
    try {
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