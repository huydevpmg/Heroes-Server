import mongoose from "mongoose";

const messageReadReceiptSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation", 
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
messageReadReceiptSchema.index({ messageId: 1, userId: 1 }, { unique: true });
messageReadReceiptSchema.index({ conversationId: 1, messageId: 1 });
messageReadReceiptSchema.index({ userId: 1, readAt: -1 });
messageReadReceiptSchema.index({ conversationId: 1, userId: 1, readAt: -1 });

const MessageReadReceipt = mongoose.model("MessageReadReceipt", messageReadReceiptSchema);

export default MessageReadReceipt;
