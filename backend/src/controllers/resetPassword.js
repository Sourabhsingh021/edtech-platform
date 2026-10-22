import crypto from "node:crypto";
import { User } from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import bcrypt from "bcrypt";

export const resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link will be sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.token = hashedResetToken;
    user.resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const frontendURL = process.env.FRONTEND_URL;

    if (!frontendURL) {
      throw new Error("FRONTEND_URL is not configured");
    }

    const resetURL = `${frontendURL.replace(/\/$/, "")}/update-password/${resetToken}`;

    await mailSender(
      normalizedEmail,
      "Reset Your SkillBridge Password",
      `You requested a password reset for your SkillBridge account.

        Use this link to reset your password within 5 minutes:
        ${resetURL}

      If you did not request this, you can ignore this email.`,
    );

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link will be sent.",
    });
  } catch (error) {
    console.error("Password reset link error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to process your request right now. Please try again later.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (
      typeof token !== "string" ||
      !token ||
      typeof password !== "string" ||
      !password ||
      typeof confirmPassword !== "string" ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Token, password, and password confirmation are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmation do not match.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      token: hashedResetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    user.token = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Your password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset your password right now. Please try again later.",
    });
  }
};
