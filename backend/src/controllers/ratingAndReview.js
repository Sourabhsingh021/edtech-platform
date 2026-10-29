import mongoose from "mongoose";
import { User } from "../models/user.js";
import { Course } from "../models/course.js";
import { RatingAndReview } from "../models/ratingAndReviews.js";
import { withTransaction } from "../utils/withTransaction.js";

export const createRatingAndReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    // Validate courseId
    if (typeof courseId !== "string" || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "A valid course ID is required",
      });
    }

    // Validate rating
    if (
      rating === undefined ||
      rating === null ||
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // Validate review only if provided
    if (review !== undefined) {
      if (typeof review !== "string" || review.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Review must be a string and cannot exceed 1000 characters",
        });
      }
    }

    //Check whether the user exists
    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //Check whether the course exists
    const courseExists = await Course.exists({ _id: courseId });

    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    //Check whether the user is enrolled
    const isEnrolled = await Course.exists({
      _id: courseId,
      studentEnrolled: userId,
    });

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to review it",
      });
    }

    //Create the review and update the course
    await withTransaction(async (session) => {
      // Prevent duplicate reviews
      const existingReview = await RatingAndReview.findOne({
        user: userId,
        course: courseId,
      }).session(session);

      if (existingReview) {
        const error = new Error("You have already reviewed this course");
        error.statusCode = 409;
        throw error;
      }

      const [newReview] = await RatingAndReview.create(
        [
          {
            user: userId,
            course: courseId,
            rating,
            review: review.trim(),
          },
        ],
        { session },
      );

      await Course.updateOne(
        { _id: courseId },
        {
          $push: {
            ratingAndReviews: newReview._id,
          },
        },
        { session },
      );
    });

    return res.status(201).json({
      success: true,
      message: "Rating and review created successfully",
    });
  } catch (error) {
    console.error("Create rating and review error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to create rating and review",
    });
  }
};

export const updateRatingAndReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    // Validate review ID
    if (typeof reviewId !== "string" || !mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "A valid review ID is required",
      });
    }

    // Validate that at least one field is provided
    if (rating === undefined && review === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide a rating or review to update",
      });
    }

    // Validate rating if provided
    if (
      rating !== undefined &&
      (typeof rating !== "number" ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // Validate review if provided
    if (
      review !== undefined &&
      (typeof review !== "string" || review.trim().length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Review must be a string with at most 1000 characters",
      });
    }

    // Find the review
    const existingReview = await RatingAndReview.findById(reviewId);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Rating and review not found",
      });
    }

    // Verify ownership
    if (existingReview.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this review",
      });
    }

    // Update only the provided fields
    if (rating !== undefined) {
      existingReview.rating = rating;
    }

    if (review !== undefined) {
      existingReview.review = review.trim();
    }

    await existingReview.save();

    return res.status(200).json({
      success: true,
      message: "Rating and review updated successfully",
      data: existingReview,
    });
  } catch (error) {
    console.error("Update rating and review error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update rating and review",
    });
  }
};

export const deleteRatingAndReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Validate review ID
    if (typeof reviewId !== "string" || !mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "A valid review ID is required",
      });
    }

    // Find the review
    const existingReview = await RatingAndReview.findById(reviewId);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Rating and review not found",
      });
    }

    // Verify ownership
    if (existingReview.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review",
      });
    }

    const courseId = existingReview.course;

    // Delete review and update course atomically
    await withTransaction(async (session) => {
      // Recheck ownership inside the transaction
      const review = await RatingAndReview.findOne({
        _id: reviewId,
        user: userId,
      }).session(session);

      if (!review) {
        const error = new Error("Rating and review not found");
        error.statusCode = 404;
        throw error;
      }

      await RatingAndReview.deleteOne(
        { _id: reviewId, user: userId },
        { session },
      );

      await Course.updateOne(
        { _id: courseId },
        {
          $pull: {
            ratingAndReviews: review._id,
          },
        },
        { session },
      );
    });

    return res.status(200).json({
      success: true,
      message: "Rating and review deleted successfully",
    });
  } catch (error) {
    console.error("Delete rating and review error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to delete rating and review",
    });
  }
};
