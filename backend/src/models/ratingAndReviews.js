import mongoose from "mongoose";

const ratingAndReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

export const RatingAndReview = mongoose.model(
  "RatingAndReview",
  ratingAndReviewSchema,
);
