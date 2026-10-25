import mongoose from "mongoose";

const subSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    timeDuration: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    videoURL: {
      type: String,
      trim: true,
    },
    videoPublicId: {
      type: String,
      trim: true,
    },
    pdfURL: {
      type: String,
      trim: true,
    },
    pdfPublicId: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export const SubSection = mongoose.model("SubSection", subSectionSchema);
