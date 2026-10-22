import otpGenerator from "otp-generator";
import { OTP } from "../models/otp.js";

const generateUniqueOTP = async () => {
  try {
    let otp;
    let isExist = true;

    while (isExist) {
      otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      isExist = await OTP.exists({ otp });
    }

    return otp;
  } catch (error) {
    throw error;
  }
};

export default generateUniqueOTP;
