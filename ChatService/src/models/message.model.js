import mongoose from "mongoose";

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
        attachments: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Attachment',
            default: []
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

export default mongoose.model("Message", messageSchema);
