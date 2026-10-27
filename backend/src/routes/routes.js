import express from "express";
import { changePassword, login, sendOTP, signup } from "../controllers/auth.js";
import { auth, isStudent, isInstructor, isAdmin } from "../middlewares/auth.js";
import { resetPassword, resetPasswordToken } from "../controllers/resetPassword.js";
import {createCategory,getAllCategories} from "../controllers/category.js";
import { createCourse, deleteCourse, getAllCourses, updateCourse } from "../controllers/course.js";
import { createSection, deleteSection, updateSection } from "../controllers/section.js";
import { createSubSection, deleteSubSection, updateSubSection } from "../controllers/subSection.js";
import { capturePayment } from "../controllers/payment.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/change-password", auth, changePassword);
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

router.post("/createCategory", auth, createCategory);
router.get("/getAllCategories", getAllCategories);

router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/updateCourse", auth, isInstructor, updateCourse);
router.post("/deleteCourse", auth, isInstructor, deleteCourse);
router.get("/getAllCourses", getAllCourses);

router.post("/createSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.delete("/deleteSection", auth, isInstructor, deleteSection);

router.post("/createSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
router.delete("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.post("/capture-payment", auth, isStudent, capturePayment);

export default router;
