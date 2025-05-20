import jwt from 'jsonwebtoken';
import fs from 'fs';

const publicKey = fs.readFileSync('./keys/public.pem');

export const verifyAccessToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, payload) => {
        if (err) return res.sendStatus(403);
        req.user = payload;        
        next();
    });
};
