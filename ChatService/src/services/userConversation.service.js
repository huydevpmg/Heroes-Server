import UserConversation from "../models/userConversation.model.js";

class UserConversationService {
  // Update UserConversation information
  async updateUserConversation(userConversationId, userId, updateData) {
    try {
      const userConversation = await UserConversation.findOneAndUpdate(
        { _id: userConversationId, userId },
        updateData,
        { new: true }
      );

      if (!userConversation) {
        throw new Error("User conversation not found or no permission");
      }

      return userConversation;
    } catch (error) {
      console.error("Error updating user conversation:", error);
      throw new Error("Error updating user conversation");
    }
  }

  // Mark message as read
  async markAsRead(userConversationId, userId, messageId) {
    return this.updateUserConversation(userConversationId, userId, {
      lastReadAt: new Date(),
      lastReadMessage: messageId,
    });
  }

  // Pin conversation
  async togglePin(userConversationId, userId) {
    try {
      const userConversation = await UserConversation.findOne({
        _id: userConversationId,
        userId: userId,
      });

      if (!userConversation) {
        return null;
      }

      return this.updateUserConversation(userConversationId, userId, {
        isPinned: !userConversation.isPinned,
      });
    } catch (error) {
      console.error("Error toggling pin:", error);
      throw new Error("Error toggling pin");
    }
  }

  // Archive or unarchive conversation
  async toggleArchive(userConversationId, userId) {
    try {
      const userConversation = await UserConversation.findOne({
        _id: userConversationId,
        userId: userId,
      });

      if (!userConversation) {
        return null;
      }

      return this.updateUserConversation(userConversationId, userId, {
        isArchived: !userConversation.isArchived,
      });
    } catch (error) {
      console.error("Error toggling archive:", error);
      throw new Error("Error toggling archive");
    }
  }

  // Add label to conversation
  async addLabel(userConversationId, userId, label) {
    const userConversation = await UserConversation.findOne({
      _id: userConversationId,
      userId: userId,
    });

    if (!userConversation) {
      return null;
    }

    const labels = [label];

    return this.updateUserConversation(userConversationId, userId, { labels });
  }

  // Remove label from conversation
  async removeLabel(userConversationId, userId, label) {
    const userConversation = await UserConversation.findOne({
      _id: userConversationId,
      userId: userId,
    });

    if (!userConversation) {
      return null;
    }

    const labels = (userConversation.labels || []).filter((l) => l !== label);

    return this.updateUserConversation(userConversationId, userId, { labels });
  }
}

export default UserConversationService;
