import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

LabelSchema.index({ name: 1, userId: 1 }, { unique: true });

const Label = mongoose.model("Label", LabelSchema);

export default Label;