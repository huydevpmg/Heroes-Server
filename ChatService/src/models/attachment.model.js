import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
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
      min: [1, "File size must be greater than 0"],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",  
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Export Attachment model
export default mongoose.model("Attachment", attachmentSchema);
