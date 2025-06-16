/**
 * @swagger
 * tags:
 *   name: Labels
 *   description: Management of conversation labels
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Label:
 *       type: object
 *       required:
 *         - name
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated label ID
 *           example: "60d21b4667d0d8992e610c85"
 *         name:
 *           type: string
 *           description: Name of the label
 *           example: "Important"
 *         userId:
 *           type: string
 *           description: User ID who owns this label
 *           example: "60d21b4667d0d8992e610c87"
 *         color:
 *           type: string
 *           description: Hex color code for the label
 *           example: "#FF5733"
 *         icon:
 *           type: string
 *           description: Emoji or icon for the label
 *           example: "⭐"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the label was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the label was last updated
 */

/**
 * @swagger
 * /api/labels:
 *   get:
 *     summary: Get all labels for current user
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's labels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Label'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 * 
 *   post:
 *     summary: Create a new label
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Label name
 *                 example: "Important"
 *     responses:
 *       201:
 *         description: Label created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Label'
 *       400:
 *         description: Bad request (missing required fields)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /api/labels/{labelId}:
 *   put:
 *     summary: Update a label
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: labelId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Very Important"
 *               color:
 *                 type: string
 *                 example: "#FF0000"
 *               icon:
 *                 type: string
 *                 example: "🔥"
 *     responses:
 *       200:
 *         description: Label updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Label'
 *       404:
 *         description: Label not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 *
 *   delete:
 *     summary: Delete a label
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: labelId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Label deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Label deleted successfully"
 *       404:
 *         description: Label not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /api/user-conversations/{userConversationId}/labels:
 *   post:
 *     summary: Add a label to a conversation
 *     tags: [Labels, UserConversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userConversationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labelId
 *             properties:
 *               labelId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Label added to conversation successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConversation'
 *       400:
 *         description: Bad request (missing label ID)
 *       404:
 *         description: Conversation or label not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 *
 * /api/user-conversations/{userConversationId}/labels/{labelId}:
 *   delete:
 *     summary: Remove a label from a conversation
 *     tags: [Labels, UserConversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userConversationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: labelId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Label removed from conversation successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConversation'
 *       404:
 *         description: User conversation not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */