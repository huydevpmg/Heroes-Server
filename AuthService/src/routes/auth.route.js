import express from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} from "../controllers/user.controller.js";  

const authRoute = express.Router();

authRoute.post("/register", registerUser);
authRoute.post("/login", loginUser);
authRoute.post("/refresh-token", refreshToken);
authRoute.post("/logout", logoutUser);

export default authRoute;
