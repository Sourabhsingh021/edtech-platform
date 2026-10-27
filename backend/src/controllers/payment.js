import { User } from "../models/user.js";
import { Course } from "../models/course.js";
import razorpay from "../config/razorpay.js";
import crypto from "node:crypto";
import mongoose from "mongoose";
import "dotenv/config";

// Capture payment and initiate a Razorpay order
export const capturePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Validate course ID
    if (
      typeof courseId !== "string" ||
      !mongoose.isObjectIdOrHexString(courseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid course ID",
      });
    }

    // Validate authenticated user
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Prevent duplicate enrollment
    const isEnrolled = course.studentEnrolled.some(
      (student) => student.toString() === userId.toString(),
    );

    if (isEnrolled) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // Validate course price
    if (!Number.isFinite(course.price) || course.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Course price is invalid",
      });
    }

    // Convert rupees to paise
    const amount = Math.round(course.price * 100);

    // Validate calculated amount
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    // Create Razorpay order
    const currency = "INR";
    const receipt = `receipt_${crypto.randomUUID()}`;

    const options = {
      amount,
      currency,
      receipt,
      notes: {
        courseId: courseId.toString(),
        userId: userId.toString(),
      },
    };

    const orderResponse = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      message: "Razorpay order created successfully",

      key: process.env.RAZORPAY_KEY_ID,

      course: {
        id: course._id,
        name: course.courseName,
        description: course.courseDescription,
        price: course.price,
      },

      order: {
        id: orderResponse.id,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
      },
    });
  } catch (error) {
    console.error("Capture payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
};