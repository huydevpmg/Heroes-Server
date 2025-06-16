/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - content
 *         - senderId
 *         - conversationId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the message
 *         content:
 *           type: string
 *           description: The content of the message
 *         senderId:
 *           type: string
 *           description: The id of the user who sent the message
 *         conversationId:
 *           type: string
 *           description: The id of the conversation
 *         status:
 *           type: string
 *           enum: [SENT, DELIVERED, READ]
 *           description: The status of the message
 *         parentMessage:
 *           type: string
 *           description: The id of the parent message (for replies)
 *         heroContext:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of hero IDs referenced in the message
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of attachment IDs
 *         reactions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               emoji:
 *                 type: string
 *           description: Array of reactions to the message
 *         isDeleteGlobal:
 *           type: boolean
 *           description: Whether the message is globally deleted
 *         deletedForUserIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who have deleted the message
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
 *   name: Messages
 *   description: Message management API
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Create a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - content
 *             properties:
 *               conversationId:
 *                 type: string
 *               content:
 *                 type: string
 *               parentMessage:
 *                 type: string
 *               heroContext:
 *                 type: array
 *                 items:
 *                   type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get messages for a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/messages/{messageId}/status:
 *   put:
 *     summary: Update message status
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [SENT, DELIVERED, READ]
 *     responses:
 *       200:
 *         description: Message status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [global, personal]
 *         required: true
 *         description: Type of deletion (global or personal)
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       400:
 *         description: Invalid delete type
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/messages/{messageId}/reactions:
 *   post:
 *     summary: Add a reaction to a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - emoji
 *             properties:
 *               userId:
 *                 type: string
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/messages/{messageId}/reactions:
 *   delete:
 *     summary: Remove a reaction from a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */ 