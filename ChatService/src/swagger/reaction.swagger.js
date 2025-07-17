/**
 * @swagger
 * tags:
 *   name: Reaction
 *   description: Reaction API
 */

/**
 * @swagger
 * /api/reaction/add:
 *   post:
 *     summary: Add a reaction to a message
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *                 example: "64a8c2e8f2b1c8e7d1a2b3c4"
 *               emoji:
 *                 type: string
 *                 example: "👍"
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reaction:
 *                   type: object
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/reaction/remove:
 *   post:
 *     summary: Remove a reaction from a message
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *                 example: "64a8c2e8f2b1c8e7d1a2b3c4"
 *               emoji:
 *                 type: string
 *                 example: "👍"
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reaction:
 *                   type: object
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/reaction/{messageId}:
 *   get:
 *     summary: Get all reactions for a message
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: List of reactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reactions:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */