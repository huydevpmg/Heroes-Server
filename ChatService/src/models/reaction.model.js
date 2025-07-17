import mongoose from "mongoose";

const messageReactionSchema = new mongoose.Schema(
    {
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
            ref: 'Message'
        },
        emoji: {
            type: String,
            required: true,
            index: true
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            }
        ]
    },
    {
        timestamps: true
    }
);

messageReactionSchema.index({ messageId: 1, emoji: 1 });

export default mongoose.model("MessageReaction", messageReactionSchema);
