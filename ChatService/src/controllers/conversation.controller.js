import ConversationService from '../services/conversation.service.js';
import { emitToRoom, emitToUser } from '../lib/socket/index.js';
import { EVENTS } from '../common/enum/socket.enum.js';

class ConversationController {
  constructor() {
    this.conversationService = new ConversationService();
  }

  createConversation = async (req, res) => {
    try {
      const { name, participants, isGroup, heroContext, createdBy } = req.body;
      const conversation = await this.conversationService.createConversation({
        name,
        participants,
        isGroup,
        heroContext,
        createdBy,
        attachments: [],
      });

      // Emit socket event for group creation
      if (isGroup) {
        conversation.participants.forEach((memberId) => {
          emitToUser(memberId.toString(), EVENTS.GROUP_CREATED, {
            _id: conversation._id.toString(),
            name: conversation.name,
            participants: conversation.participants.map(id => id.toString()),
            isGroup: conversation.isGroup,
            createdBy: conversation.createdBy.toString(),
            createdAt: conversation.createdAt
          });
        });
      }

      return res.status(201).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getConversations = async (req, res) => {
    try {
      const userId  = req.user.id;
      const conversations = await this.conversationService.getConversations(userId);
      return res.status(200).json(conversations);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getConversationById = async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await this.conversationService.getConversationById(id);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  findOrCreate1on1Conversation = async (req, res) => {
    try {
      const userId1 = req.user.id;
      const { participantId } = req.body;
      const conversation = await this.conversationService.findOrCreate1on1Conversation(
        userId1,
        participantId,
      );
      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateConversation = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const conversation = await this.conversationService.updateConversation(id, updateData);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  getAllUsers = async(req, res) => {
    try {
      const users = await this.conversationService.getAllUsers();
      return res.status(200).json(users);
    } 
    catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  updateLastAttachmentName = async (req, res) => {
    const { id } = req.params;
    const { lastAttachmentName } = req.body;
    try {
      const conversation = await this.conversationService.updateLastAttachmentName(id, lastAttachmentName);
      res.json(conversation);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  addMemberToGroup = async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const { memberIds } = req.body;
      const currentUserId = req.user.id;
  
      // Validate input
      if (!Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({
          message: 'Member IDs array is required and cannot be empty'
        });
      }
  
      const result = await this.conversationService.addMemberToGroup(
        conversationId,
        memberIds,
        currentUserId
      );
  
      const payload = {
        conversationId,
        addedMembers: result.addedMembers,
        conversation: result.conversation,
        systemMessage: result.systemMessage
      };
  
      emitToRoom(conversationId, EVENTS.MEMBER_ADDED, payload);
      
      result.addedMembers.forEach(memberId => {
        emitToUser(memberId, EVENTS.MEMBER_ADDED, payload);
      });
  
      return res.status(200).json({
        message: 'Members added successfully',
        data: result
      });
  
    } catch (error) {
      const message = error.message || 'Internal server error';
  
      if (message.includes('not found')) {
        return res.status(404).json({ message });
      }
  
      if (
        message.includes('Cannot add members') ||
        message.includes('already members')
      ) {
        return res.status(400).json({ message });
      }
  
      return res.status(500).json({ message });
    }
  };

  removeMemberFromGroup = async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const { userId } = req.body;
      const currentUserId = req.user.id;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const result = await this.conversationService.removeMemberFromGroup(conversationId, userId, currentUserId);
      
      // Emit socket event to notify all participants about member removal
      emitToRoom(conversationId, EVENTS.MEMBER_REMOVED, {
        conversationId,
        removedUserId: result.removedUserId,
        conversation: result.conversation,
        systemMessage: result.systemMessage
      });

      return res.status(200).json({
        message: 'Member removed successfully',
        data: result
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('Cannot remove members') || error.message.includes('not a member')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  };

  /**
   * Leave group conversation
   * PATCH /api/conversations/leave/:id
   */
  leaveGroup = async (req, res) => {
    try {
      const { id: userId, fullName } = req.user;
      const { id: conversationId } = req.params;
      await this.conversationService.leaveGroup(conversationId, userId);

      emitToRoom(conversationId, EVENTS.RECEIVE_MESSAGE, {
        conversationId,
        type: 'SYSTEM',
        systemType: 'USER_LEAVE',
        meta: { userId, fullName: fullName },
      });
      emitToRoom(conversationId, EVENTS.LEAVE_GROUP_NOTIFY, { userId, conversationId });
      emitToUser(userId, EVENTS.LEAVE_GROUP, { userId, conversationId });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default ConversationController;