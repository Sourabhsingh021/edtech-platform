import express from "express";
import { changePassword, login, sendOTP, signup } from "../controllers/auth.js";
import { auth, isStudent, isInstructor, isAdmin } from "../middlewares/auth.js";
import { resetPassword, resetPasswordToken } from "../controllers/resetPassword.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/change-password", auth, changePassword);
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

export default router;
