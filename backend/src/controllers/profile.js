import { User } from "../models/user.js";
import { Profile } from "../models/profile.js";
import mongoose from "mongoose";
import { withTransaction } from "../utils/withTransaction.js";
import { Course } from "../models/course.js";

export const updateProfile = async (req, res) => {
  try {
    const { dateOfBirth, about, gender, contactNumber } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userDetails = await User.findById(userId);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profileDetails = await Profile.findById(
      userDetails.additionalDetails,
    );

    if (!profileDetails) {
      return res.status(404).json({
        success: false,
        message: "Profile data not found",
      });
    }

    if (dateOfBirth !== undefined) profileDetails.dateOfBirth = dateOfBirth;
    if (about !== undefined) profileDetails.about = about;
    if (gender !== undefined) profileDetails.gender = gender;
    if (contactNumber !== undefined) {
      profileDetails.contactNumber = contactNumber;
    }

    await profileDetails.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not update your profile",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Validate authenticated user
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deletion while the instructor still owns courses
    if (user.accountType === "instructor") {
      const instructorCourses = await Course.exists({
        instructor: user._id,
      });

      if (instructorCourses) {
        return res.status(409).json({
          success: false,
          message:
            "Transfer or delete your courses before deleting your account",
        });
      }
    }

    await withTransaction(async (session) => {
      // Remove the user from enrolled students arrays
      await Course.updateMany(
        { studentEnrolled: user._id },
        { $pull: { studentEnrolled: user._id } },
        { session },
      );

      // Delete associated profile
      if (user.additionalDetails) {
        await Profile.deleteOne({ _id: user.additionalDetails }, { session });
      }

      // Delete the user
      await User.deleteOne({ _id: user._id }, { session });
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account failed:", error);

    return res.status(500).json({
      success: false,
      message: "Could not delete account",
    });
  }
};
