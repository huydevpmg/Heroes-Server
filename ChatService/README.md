# Chative.IO Chat Service

This service handles real-time messaging functionality for the Chative.IO platform.

## Features

- Real-time messaging with Socket.IO
- One-on-one conversations
- Group conversations
- Message status tracking (sent, delivered, read)
- File attachments
- Message reactions

## API Documentation

The API documentation is available via Swagger UI at:

```
http://localhost:5000/api-docs
```

## Setup

1. Install dependencies:

```bash
yarn install
# or
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:

```bash
yarn start
# or
npm start
```

## Swagger Documentation

The API is documented using a custom Swagger implementation. To access the documentation:

1. Start the server
2. Navigate to `http://localhost:5000/api-docs` in your browser

To update the documentation, edit the Swagger configuration in `src/swagger/swagger.js`.