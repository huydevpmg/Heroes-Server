import mongoose from 'mongoose';

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

TagSchema.index({ name: 1, owner: 1 }, { unique: true });

export default mongoose.model('Tag', TagSchema);
