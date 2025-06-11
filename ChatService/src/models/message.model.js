import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    status: {
      type: String,
      enum: ["SENT", "DELIVERED", "READ"],
      default: "SENT",
    },
    parentMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    heroContext: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hero",
      required: false,
    }],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      },
    ],
    isDeleteGlobal: { type: Boolean, default: false },
    deletedForUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: { createdAt: "createAt", updatedAt: "updatedAt" },
  }
);

export default mongoose.model("Message", messageSchema);
