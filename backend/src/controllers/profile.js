import { User } from "../models/User.js";
import {Profile} from "../models/profile.js"

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
      userDetails.additionalDetails
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