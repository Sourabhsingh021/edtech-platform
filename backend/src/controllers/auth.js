import { OTP } from "../models/otp.js";
import { Profile } from "../models/Profile.js";
import { User } from "../models/User.js";
import generateUniqueOTP from "../utils/generateUniqueOTP.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    email = email.trim().toLowerCase();

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const otp = await generateUniqueOTP();
    await OTP.create({ email, otp });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

const verifyOTP = async (email, otp) => {
  console.log(email, otp)
  const otpData = await OTP.findOne({ email }).sort({ createdAt: -1 });
  console.log(otpData)

  if (!otpData) {
    return false;
  }

  if (otpData.otp !== otp) {
    return false;
  }

  const isOTPExpired =
    Date.now() - otpData.createdAt.getTime() >= 5 * 60 * 1000;

  if (isOTPExpired) {
    return false;
  }

  await OTP.deleteOne({ _id: otpData._id });
  return true;
};

//signup
export const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      typeof email !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const allowedAccountTypes = ["student", "instructor"];

    if (!allowedAccountTypes.includes(accountType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account type",
      });
    }

    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password and confirm password does not match",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User aready Exists",
      });
    }

    const isOTPValid = await verifyOTP(normalizedEmail, otp);
    console.log(isOTPValid,otp)
    if (!isOTPValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileData = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber,
    });

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      accountType,
      additionalDetails: profileData._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(201).json({
      success: true,
      message: "User is registered successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again",
    });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User is not registered, please signup first",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      const options = {
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      };
      return res.cookie("token", token, options).json({
        success: true,
        message: "logged in successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          accountType: user.accountType,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure, Please try again",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (
      typeof oldPassword !== "string" ||
      !oldPassword ||
      typeof newPassword !== "string" ||
      !newPassword ||
      typeof confirmNewPassword !== "string" ||
      !confirmNewPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all password fields.",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};
