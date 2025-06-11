import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Attachment", attachmentSchema);
