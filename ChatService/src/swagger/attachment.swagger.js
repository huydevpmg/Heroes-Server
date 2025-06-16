/**
 * @swagger
 * components:
 *   schemas:
 *     Attachment:
 *       type: object
 *       required:
 *         - type
 *         - url
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the attachment
 *         type:
 *           type: string
 *           enum: [IMAGE, VIDEO, FILE, AUDIO]
 *           description: Type of attachment
 *         url:
 *           type: string
 *           description: URL of the attachment
 *         fileName:
 *           type: string
 *           description: Original file name
 *         fileSize:
 *           type: number
 *           description: Size of the file in bytes
 *         mimeType:
 *           type: string
 *           description: MIME type of the file
 *         userId:
 *           type: string
 *           description: ID of the user who uploaded the attachment
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
 *   name: Attachments
 *   description: Attachment management API
 */

/**
 * @swagger
 * /api/attachments:
 *   post:
 *     summary: Upload a new attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attachment'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/attachments:
 *   get:
 *     summary: Get all attachments
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of attachments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attachment'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/attachments/type:
 *   get:
 *     summary: Get attachments by type
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IMAGE, VIDEO, FILE, AUDIO]
 *         required: true
 *         description: Type of attachment
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of attachments by type
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attachment'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/attachments/{id}:
 *   get:
 *     summary: Get an attachment by ID
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: Attachment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attachment'
 *       404:
 *         description: Attachment not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/attachments/{id}:
 *   delete:
 *     summary: Delete an attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *       404:
 *         description: Attachment not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/attachments/user/{userId}:
 *   get:
 *     summary: Get attachments by user ID
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of user's attachments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attachment'
 *       500:
 *         description: Server error
 */ 