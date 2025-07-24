import { registerAttachmentListener } from "./attachment.listener.js";
import { registerConversationListener } from "./conversation.listener.js";
import { registerMessageListener } from "./message.listener.js";
import { registerProfileListener } from "./profile.listener.js";
import { registerReactionListener } from "./reaction.listener.js";
import { registerReadReceiptListener } from "./readReceipt.listener.js";

export function registerRedisSubscribers() {
  registerMessageListener();
  registerProfileListener();
  registerAttachmentListener()
  registerConversationListener()
  registerReactionListener();
  registerReadReceiptListener();
}