// Simple Swagger documentation without external dependencies

// Define the OpenAPI specification
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Chative.IO Chat Service API',
    version: '1.0.0',
    description: 'API documentation for the Chat Service of Chative.IO',
    contact: {
      name: 'Chative.IO Support',
      email: 'support@chative.io',
    },
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Chat server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Message: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Message ID',
          },
          content: {
            type: 'string',
            description: 'Message content',
          },
          senderId: {
            type: 'string',
            description: 'User ID of the sender',
          },
          conversationId: {
            type: 'string',
            description: 'Conversation ID',
          },
          status: {
            type: 'string',
            enum: ['SENT', 'DELIVERED', 'READ'],
            description: 'Message status',
          },
          parentMessage: {
            type: 'string',
            description: 'Parent message ID for replies',
            nullable: true,
          },
          heroContext: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Hero IDs related to this message',
          },
          attachments: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Attachment IDs',
          },
          reactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  description: 'User ID who reacted',
                },
                emoji: {
                  type: 'string',
                  description: 'Emoji reaction',
                },
              },
            },
            description: 'Message reactions',
          },
          isDeleteGlobal: {
            type: 'boolean',
            description: 'Whether the message is deleted for everyone',
          },
          deletedForUserIds: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'User IDs for whom the message is deleted',
          },
          createAt: {
            type: 'string',
            format: 'date-time',
            description: 'Message creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Message update timestamp',
          },
        },
      },
      Conversation: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Conversation ID',
          },
          name: {
            type: 'string',
            description: 'Conversation name (for group chats)',
            nullable: true,
          },
          participants: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'User IDs of participants',
          },
          isGroup: {
            type: 'boolean',
            description: 'Whether this is a group conversation',
          },
          heroContext: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Hero IDs related to this conversation',
          },
          createdBy: {
            type: 'string',
            description: 'User ID of the creator',
          },
          lastMessage: {
            type: 'string',
            description: 'ID of the last message',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Conversation creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Conversation update timestamp',
          },
        },
      },
      Attachment: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Attachment ID',
          },
          name: {
            type: 'string',
            description: 'File name',
          },
          url: {
            type: 'string',
            description: 'File URL',
          },
          type: {
            type: 'string',
            description: 'File MIME type',
          },
          size: {
            type: 'number',
            description: 'File size in bytes',
          },
          uploadedBy: {
            type: 'string',
            description: 'User ID who uploaded the file',
          },
          conversationId: {
            type: 'string',
            description: 'Conversation ID',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Upload timestamp',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/api/conversation/connect': {
      post: {
        summary: 'Create or find a 1-on-1 conversation between two users',
        tags: ['Conversations'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['partnerId'],
                properties: {
                  partnerId: {
                    type: 'string',
                    description: 'User ID of the conversation partner',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Conversation found or created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    conversation: {
                      $ref: '#/components/schemas/Conversation',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/conversation/create-group': {
      post: {
        summary: 'Create a new group conversation',
        tags: ['Conversations'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'members'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'Name of the group conversation',
                  },
                  members: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Array of user IDs to add to the group',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Group conversation created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    conversation: {
                      $ref: '#/components/schemas/Conversation',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/messages/send': {
      post: {
        summary: 'Send a message to a conversation',
        tags: ['Messages'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['conversationId', 'content'],
                properties: {
                  conversationId: {
                    type: 'string',
                    description: 'ID of the conversation',
                  },
                  content: {
                    type: 'string',
                    description: 'Message content',
                  },
                  attachments: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Array of attachment IDs (optional)',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Message sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      $ref: '#/components/schemas/Message',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request - missing required fields',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/messages/{conversationId}': {
      get: {
        summary: 'Get messages from a conversation with pagination',
        tags: ['Messages'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'conversationId',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ID of the conversation',
          },
          {
            in: 'query',
            name: 'limit',
            schema: {
              type: 'integer',
              default: 20,
            },
            description: 'Number of messages to return',
          },
          {
            in: 'query',
            name: 'skip',
            schema: {
              type: 'integer',
              default: 0,
            },
            description: 'Number of messages to skip (for pagination)',
          },
        ],
        responses: {
          200: {
            description: 'Messages retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    messages: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Message',
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
  },
};

// Simple HTML template for Swagger UI
const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chative.IO API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(swaggerDocument)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
      window.ui = ui;
    };
  </script>
</body>
</html>
`;

// Setup function to add Swagger to Express app
export const setupSwagger = (app) => {
  // Serve Swagger UI
  app.get('/api-docs', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(swaggerHtml);
  });

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });
};