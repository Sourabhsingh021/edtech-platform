import express from "express";
import { changePassword, login, sendOTP, signup } from "../controllers/auth.js";
import { auth, isStudent, isInstructor, isAdmin } from "../middlewares/auth.js";
import { resetPassword, resetPasswordToken } from "../controllers/resetPassword.js";
import {createCategory,getAllCategories} from "../controllers/category.js";
import { createCourse, deleteCourse, getAllCourses, updateCourse } from "../controllers/course.js";
import { createSection, deleteSection, updateSection } from "../controllers/section.js";
import { createSubSection, deleteSubSection, updateSubSection } from "../controllers/subSection.js";
import { capturePayment } from "../controllers/payment.js";
import { createRatingAndReview, deleteRatingAndReview, updateRatingAndReview } from "../controllers/ratingAndReview.js";
import { deleteAccount, updateProfile } from "../controllers/profile.js";

const router = express.Router();

//auth
router.post("/send-otp", sendOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/change-password", auth, changePassword);
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);
router.patch("/updateProfile", auth, updateProfile);
router.delete("/deleteAccount", auth, deleteAccount);

//category
router.post("/createCategory", auth, createCategory);
router.get("/getAllCategories", getAllCategories);

//course
router.post("/createCourse", auth, isInstructor, createCourse);
router.patch("/updateCourse", auth, isInstructor, updateCourse);
router.post("/deleteCourse", auth, isInstructor, deleteCourse);
router.get("/getAllCourses", getAllCourses);

//section
router.post("/createSection", auth, isInstructor, createSection);
router.patch("/updateSection", auth, isInstructor, updateSection);
router.delete("/deleteSection", auth, isInstructor, deleteSection);

//sub-section
router.post("/createSubSection", auth, isInstructor, createSubSection);
router.patch("/updateSubSection", auth, isInstructor, updateSubSection);
router.delete("/deleteSubSection", auth, isInstructor, deleteSubSection);

//payments
router.post("/capture-payment", auth, isStudent, capturePayment);

//rating and review
router.post("/courses/:courseId/reviews", auth, isStudent, createRatingAndReview);
router.patch("/reviews/:reviewId", auth, isStudent, updateRatingAndReview);
router.delete("/reviews/:reviewId", auth, isStudent, deleteRatingAndReview);

export default router;
