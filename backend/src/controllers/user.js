import { User } from "../models/user.js";

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("additionalDetails");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user details",
    });
  }
};