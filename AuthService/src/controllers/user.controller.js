import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/auth.js";


export const registerUser = async (req, res) => {
  try {
    const { username, password, email, fullName } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      fullName,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password} = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    const accessToken = generateAccessToken({
      username: user.username,
      id: user._id,
    });
    const refreshToken = generateRefreshToken({
      username: user.username,
      id: user._id,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,        
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = generateAccessToken({
      username: decoded.username,
      id: decoded.id,
    });

    res.status(200).json({ accessToken: newAccessToken });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};
