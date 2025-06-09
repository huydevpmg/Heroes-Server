import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    gender: { 
      type: String, 
      required: true, 
      enum: ["Male", "Female", "Other"]
    },
    age: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

     tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

heroSchema.index({ owner: 1, name: 1 });
const Hero = mongoose.model("Hero", heroSchema);

export default Hero;
