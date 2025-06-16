import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  icon: { type: String }, // unicode icon, emoji or svg/png url
  userId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

LabelSchema.index({ name: 1, userId: 1 }, { unique: true }); // User cannot have duplicate label names, but different users can

const Label = mongoose.model("Label", LabelSchema);

export default Label;