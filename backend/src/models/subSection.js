import mongoose from "mongoose";

const subSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    timeDuration: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    videoURL: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export const SubSection = mongoose.model("SubSection", subSectionSchema);
