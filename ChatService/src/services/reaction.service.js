import MessageReaction from "../models/reaction.model.js";
import Message from "../models/message.model.js";
import userProfileService from "./userProfile.service.js";
import { publish } from "../lib/redis/redis.js";
import { REDIS_CHANNEL } from "../common/enum/redis/redis.enum.js";
class ReactionService {
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
        const userObjs = await userProfileService.getUsers(reaction.users);
        reaction = reaction.toObject();
        reaction.users = userObjs;
        return reaction;
      })
    );

    const messageObj = message.toObject();
    messageObj.reactions = reactions;

    await publish(REDIS_CHANNEL.MESSAGE_REACTION, messageObj);
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
        const userObjs = await userProfileService.getUsers(reaction.users);
        reaction = reaction.toObject();
        reaction.users = userObjs;
        return reaction;
      })
    );

    const messageObj = message.toObject();
    messageObj.reactions = reactions;
    
    await publish(REDIS_CHANNEL.REMOVE_REACTION, messageObj);
    return messageObj;
  }

  async getReactionsByMessage(messageId) {
    return MessageReaction.find({ messageId });
  }
}

export default ReactionService;
