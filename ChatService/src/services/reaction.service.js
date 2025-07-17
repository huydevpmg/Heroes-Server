import MessageReaction from "../models/reaction.model.js";
import Message from "../models/message.model.js";
import axios from "axios";

class ReactionService {
  constructor() {
    this.authServiceUrl = "http://localhost:4000/api";
  }

  async addReaction({ messageId, emoji, userId }) {
    let reaction = await MessageReaction.findOne({ messageId, emoji });
    if (reaction) {
      if (!reaction.users.includes(userId)) {
        reaction.users.push(userId);
        await reaction.save();
      }
    } else {
      reaction = await MessageReaction.create({
        messageId,
        emoji,
        users: [userId],
      });
    }
    const message = await Message.findById(messageId);
    let reactions = await MessageReaction.find({ messageId });

    // Populate user data for each reaction
    reactions = await Promise.all(
      reactions.map(async (reaction) => {
        const userObjs = await Promise.all(
          reaction.users.map(async (uid) => {
            const { data } = await axios.get(
              `${this.authServiceUrl}/profile/${uid}`
            );
            return data || { _id: uid };
          })
        );
        reaction = reaction.toObject();
        reaction.users = userObjs;
        return reaction;
      })
    );

    const messageObj = message.toObject();
    messageObj.reactions = reactions;
    return messageObj;
  }

  async removeReaction({ messageId, emoji, userId }) {
    const reaction = await MessageReaction.findOne({ messageId, emoji });
    if (reaction) {
      reaction.users = reaction.users.filter(
        (id) => id.toString() !== userId.toString()
      );
      if (reaction.users.length === 0) {
        await reaction.deleteOne();
      } else {
        await reaction.save();
      }
    }
    const message = await Message.findById(messageId);
    let reactions = await MessageReaction.find({ messageId });

    // Populate user data for each reaction
    reactions = await Promise.all(
      reactions.map(async (reaction) => {
        const userObjs = await Promise.all(
          reaction.users.map(async (uid) => {
            const { data } = await axios.get(
              `${this.authServiceUrl}/profile/${uid}`
            );
            return data || { _id: uid };
          })
        );
        reaction = reaction.toObject();
        reaction.users = userObjs;
        return reaction;
      })
    );

    const messageObj = message.toObject();
    messageObj.reactions = reactions;
    return messageObj;
  }

  async getReactionsByMessage(messageId) {
    return MessageReaction.find({ messageId });
  }
}

export default ReactionService;
