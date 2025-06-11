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
      ref: "User", 
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
      type: String,
      default: []
    }],
  },
  { timestamps: true }
);

const UserConversation = mongoose.model("UserConversation", UserConversationSchema);

export default UserConversation;