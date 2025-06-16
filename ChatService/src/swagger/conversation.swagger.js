/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       required:
 *         - type
 *         - members
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the conversation
 *         type:
 *           type: string
 *           enum: [1ON1, GROUP]
 *           description: Type of conversation
 *         name:
 *           type: string
 *           description: Name of the conversation (for group chats)
 *         avatar:
 *           type: string
 *           description: Avatar URL of the conversation
 *         members:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of member user IDs
 *         lastMessage:
 *           type: string
 *           description: ID of the last message
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
 *   name: Conversations
 *   description: Conversation management API
 */

/**
 * @swagger
 * /api/conversations/1on1:
 *   post:
 *     summary: Find or create a 1-on-1 conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partnerId
 *             properties:
 *               partnerId:
 *                 type: string
 *                 description: ID of the partner user
 *     responses:
 *       200:
 *         description: Conversation found or created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create a new group conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - members
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [GROUP]
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Group conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Get all conversations for the current user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/conversations/{id}:
 *   get:
 *     summary: Get a conversation by ID
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */ 