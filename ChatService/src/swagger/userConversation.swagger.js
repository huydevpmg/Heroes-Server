/**
 * @swagger
 * components:
 *   schemas:
 *     UserConversation:
 *       type: object
 *       required:
 *         - userId
 *         - conversationId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user conversation
 *         userId:
 *           type: string
 *           description: ID of the user
 *         conversationId:
 *           type: string
 *           description: ID of the conversation
 *         lastReadMessage:
 *           type: string
 *           description: ID of the last read message
 *         isArchived:
 *           type: boolean
 *           description: Whether the conversation is archived
 *         isPinned:
 *           type: boolean
 *           description: Whether the conversation is pinned
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of labels
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: UserConversations
 *   description: User conversation management API
 */

/**
 * @swagger
 * /api/user-conversations/{conversationId}:
 *   put:
 *     summary: Update user conversation settings
 *     tags: [UserConversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastReadMessage:
 *                 type: string
 *               isArchived:
 *                 type: boolean
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User conversation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConversation'
 *       404:
 *         description: User conversation not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/user-conversations/{conversationId}/archive:
 *   put:
 *     summary: Toggle archive status of a conversation
 *     tags: [UserConversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Archive status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConversation'
 *       404:
 *         description: User conversation not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/user-conversations/{conversationId}/read:
 *   put:
 *     summary: Mark a conversation as read
 *     tags: [UserConversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: ID of the last read message
 *     responses:
 *       200:
 *         description: Conversation marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConversation'
 *       404:
 *         description: User conversation not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/user-conversations/{conversationId}/pin:
 *   put:
 *     summary: Toggle pin status of a conversation
 *     tags: [UserConversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Pin status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConversation'
 *       404:
 *         description: User conversation not found
 *       500:
 *         description: Server error
 */