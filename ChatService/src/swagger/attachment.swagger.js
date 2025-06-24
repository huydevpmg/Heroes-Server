/**
 * @swagger
 * components:
 *   schemas:
 *     Attachment:
 *       type: object
 *       required:
 *         - name
 *         - url
 *         - type
 *         - size
 *         - uploadedBy
 *         - conversationId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the attachment
 *         name:
 *           type: string
 *           description: Original file name
 *         url:
 *           type: string
 *           description: URL of the attachment
 *         type:
 *           type: string
 *           description: MIME type of the file
 *         size:
 *           type: number
 *           description: Size of the file in bytes
 *         uploadedBy:
 *           type: string
 *           description: ID of the user who uploaded the attachment
 *         conversationId:
 *           type: string
 *           description: ID of the conversation
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
 *   - name: Attachments
 *     description: Attachment management API
 */

/**
 * @swagger
 * /api/attachments:
 *   post:
 *     summary: Upload a new attachment (file upload to GCS)
 *     tags: [Attachments]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - conversationId
 *               - uploadedBy
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation
 *               uploadedBy:
 *                 type: string
 *                 description: ID of the user uploading the file
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/attachments:
 *   get:
 *     summary: Get all attachments (optionally by conversationId)
 *     tags: [Attachments]
 *     parameters:
 *       - in: query
 *         name: conversationId
 *         schema:
 *           type: string
 *         description: Filter by conversationId
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
 *     summary: Get attachments by type in a conversation
 *     tags: [Attachments]
 *     parameters:
 *       - in: query
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: Conversation ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: MIME type (e.g. image/png, application/pdf)
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
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
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