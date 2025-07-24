import mongoose from "mongoose";
import { config } from "../config/index.js";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose
      .connect(config.mongoUrl)
      .then(() => console.log("MongoDB Connected"))
      .catch((err) => console.error("MongoDB Connection Error:", err));
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};


export default connectDB;
