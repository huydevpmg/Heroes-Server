import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("MongoDB Connected"))
      .catch((err) => console.error("MongoDB Connection Error:", err));
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

export default connectDB;
