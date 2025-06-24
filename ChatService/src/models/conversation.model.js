import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    heroContext: [{
      type: mongoose.Schema.Types.ObjectId,
      default: []
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attachment',
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;