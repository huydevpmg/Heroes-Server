import jwt from 'jsonwebtoken';
import fs from 'fs';

const publicKeyPath = process.env.PUBLIC_KEY_PATH || './keys/public.pem';

// Read the public key to verify the JWT
const getPublicKey = () => {
  try {
    return fs.readFileSync(publicKeyPath, 'utf8');
  } catch (error) {
    console.error('Failed to read public key:', error);
    process.exit(1);
  }
};

const publicKey = getPublicKey();

// Verify JWT function that will be used in both WebSocket and HTTP routes
const verifyToken = (token, callback) => {
  jwt.verify(token, publicKey, { algorithms: ['RS256'] }, callback);
};

// Extract token from the request or socket headers
const getToken = (request) => {
  // HTTP request
  if (request.headers) {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const [, token] = authHeader.split(' ');
      return token;
    }
  }
  
  // WebSocket
  if (request.handshake) {
    const authHeader = request.handshake.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const [, token] = authHeader.split(' ');
      return token;
    }
  }

  return null;
};

// Middleware to protect routes (HTTP API)
export const protectRoute = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Authentication error: No token provided' });
  }

  verifyToken(token, (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).json({ message: 'Authentication error: Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// WebSocket authentication function
export const socketAuth = (socket, next) => {
  const token = getToken(socket);

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  verifyToken(token, (err, decoded) => {
    if (err || !decoded) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }

    // Attach user data to the socket
    socket.userId = decoded.userId;
    socket.username = decoded.username;
    next();
  });
};
