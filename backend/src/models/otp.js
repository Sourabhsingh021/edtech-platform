import mongoose from "mongoose";
import mailSender from "../utils/mailSender.js";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

const sendVerificationMail = async (email, otp) => {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from SkillBridge",
      `Your OTP is: ${otp}`,
    );

    console.log("Email sent successfully:", mailResponse);
    return mailResponse;
  } catch (error) {
    console.error("Error occurred while sending the email:", error);
    throw error;
  }
};

otpSchema.pre("save", async function () {
  await sendVerificationMail(this.email, this.otp);
});

export const OTP = mongoose.model("OTP", otpSchema);
