/**
 * @swagger
 * components:
 *   schemas:
 *     MessageReadReceipt:
 *       type: object
 *       required:
 *         - messageId
 *         - userId
 *         - conversationId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the read receipt
 *         messageId:
 *           type: string
 *           description: The id of the message that was read
 *         userId:
 *           type: string
 *           description: The id of the user who read the message
 *         conversationId:
 *           type: string
 *           description: The id of the conversation
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: When the message was read
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             fullName:
 *               type: string
 *             email:
 *               type: string
 *             avatar:
 *               type: string
 *           description: User data from AuthService
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
 *   name: Read Receipts
 *   description: Message read receipt management API
 */

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   post:
 *     summary: Mark a message as read
 *     tags: [Read Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to mark as read
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - conversationId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user marking the message as read
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation
 *     responses:
 *       200:
 *         description: Message marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/MessageReadReceipt'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/conversations/{conversationId}/read:
 *   post:
 *     summary: Mark multiple messages as read (bulk operation)
 *     tags: [Read Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the conversation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - messageIds
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user marking messages as read
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of message IDs to mark as read
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MessageReadReceipt'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/messages/{messageId}/read-receipts:
 *   get:
 *     summary: Get read receipts for a message
 *     tags: [Read Receipts]
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
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the conversation (optional, for extra safety)
 *     responses:
 *       200:
 *         description: Read receipts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MessageReadReceipt'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/conversations/{conversationId}/read-receipts:
 *   get:
 *     summary: Get read receipts for multiple messages in a conversation
 *     tags: [Read Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the conversation
 *       - in: query
 *         name: messageIds
 *         schema:
 *           type: string
 *         required: false
 *         description: Comma-separated list of message IDs (optional)
 *     responses:
 *       200:
 *         description: Conversation read receipts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/MessageReadReceipt'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/conversations/{conversationId}/read-all/{messageId}:
 *   get:
 *     summary: Get users who have read all messages up to a specific message
 *     tags: [Read Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the conversation
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the last message to check
 *     responses:
 *       200:
 *         description: Users who read all messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       avatar:
 *                         type: string
 *       500:
 *         description: Server error
 */
