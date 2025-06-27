import mongoose from "mongoose";

const UserConversationSchema = new mongoose.Schema(
  {
    conversationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Conversation", 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true 
    },
    lastReadAt: { 
      type: Date 
    },
    lastReadMessage: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Message" 
    },
    isPinned: { 
      type: Boolean, 
      default: false 
    },
    isArchived: { 
      type: Boolean, 
      default: false 
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
    labels: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
      default: [],
    }],
    clearAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// INDEXES
UserConversationSchema.index({ conversationId: 1, userId: 1 }, { unique: true });
UserConversationSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
UserConversationSchema.index({ conversationId: 1 });
UserConversationSchema.index({ userId: 1, isDeleted: 1, isArchived: 1 });

const UserConversation = mongoose.model("UserConversation", UserConversationSchema);

export default UserConversation;