/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       required:
 *         - participants
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the conversation
 *         name:
 *           type: string
 *           description: Name of the conversation
 *         avatar:
 *           type: string
 *           description: Avatar URL of the conversation
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of participant user IDs
 *         isGroup:
 *           type: boolean
 *           description: Whether this is a group conversation
 *         lastMessage:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             senderId:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         isPinned:
 *           type: boolean
 *           description: Whether the conversation is pinned
 *         isArchived:
 *           type: boolean
 *           description: Whether the conversation is archived
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of labels for the conversation
 *         lastReadAt:
 *           type: string
 *           format: date-time
 *           description: Last time the conversation was read
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
 *               - participantId
 *             properties:
 *               participantId:
 *                 type: string
 *                 description: ID of the participant user
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
 *               - participants
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               participants:
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