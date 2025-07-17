import Label from '../models/label.model.js';
import UserConversation from '../models/userConversation.model.js';
import { getRandomColor, getRandomIcon } from '../utils/labelUtils.js';

class LabelService {
  async createLabel(userId, { name, color, icon }) {
    const labelColor = color || getRandomColor();
    const labelIcon = icon || getRandomIcon();
    const label = new Label({ userId, name, color: labelColor, icon: labelIcon });
    await label.save();
    return label;
  }

  async getUserLabels(userId) {
    return Label.find({ userId }).sort({ name: 1 });
  }

  async updateLabel(labelId, userId, updateData) {
    const updated = await Label.findOneAndUpdate(
      { _id: labelId, userId },
      updateData,
      { new: true }
    );
    if (!updated) {
      throw new Error('Label not found or no permission');
    }
    return updated;
  }

  async deleteLabel(labelId, userId) {
    const deleted = await Label.findOneAndDelete({ _id: labelId, userId });
    if (!deleted) {
      throw new Error('Label not found or no permission');
    }

    await UserConversation.updateMany(
      { userId, labels: labelId },
      { $pull: { labels: labelId } }
    );
    return true;
  }

  async addLabelToConversation(userConversationId, userId, labelId) {
    const label = await Label.findOne({ _id: labelId, userId });
    if (!label) {
      throw new Error('Label not found or no permission');
    }
    const updated = await UserConversation.findOneAndUpdate(
      { _id: userConversationId, userId, labels: { $ne: labelId } },
      { $push: { labels: labelId } },
      { new: true }
    ).populate('labels');

    if (!updated) {
      throw new Error('User conversation not found or label already added');
    }
    return updated;
  }

  async removeLabelFromConversation(userConversationId, userId, labelId) {
    const updated = await UserConversation.findOneAndUpdate(
      { _id: userConversationId, userId },
      { $pull: { labels: labelId } },
      { new: true }
    ).populate('labels');

    if (!updated) {
      throw new Error('User conversation not found');
    }
    return updated;
  }
}

export default LabelService;