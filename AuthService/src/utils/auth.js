import jwt from "jsonwebtoken";
import fs from "fs";

const privateKey = fs.readFileSync("./keys/private.pem");  
const publicKey = fs.readFileSync("./keys/public.pem");  

export function generateAccessToken({ username, id }) {
  return jwt.sign({ username, id }, privateKey, {
    algorithm: "RS256",
  });
}

export function generateRefreshToken({ username, id }) {
  return jwt.sign({ username, id }, privateKey, {
    algorithm: "RS256",
    expiresIn: "7d",
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
  } catch (err) {
    return null;
  }
}