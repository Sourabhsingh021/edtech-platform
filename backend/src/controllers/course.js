import { User } from "../models/user.js";
import { Category } from "../models/category.js";
import { Course } from "../models/course.js";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../utils/fileUploader.js";
import "dotenv/config";
import { SubSection } from "../models/subSection.js";
import mongoose from "mongoose";
import { withTransaction } from "../utils/withTransaction.js";
import { Section } from "../models/section.js";

export const createCourse = async (req, res) => {
  let thumbnailImage;

  try {
    const { courseName, courseDescription, price } = req.body;

    let categoryIds;
    try {
      categoryIds = JSON.parse(req.body.categoryId);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId format",
      });
    }

    // Validate required text fields
    if (
      typeof courseName !== "string" ||
      typeof courseDescription !== "string" ||
      !courseName.trim() ||
      !courseDescription.trim() ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All valid fields are required",
      });
    }

    // Validate price
    if (
      price === null ||
      String(price).trim() === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    // Validate categories
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one category is required",
      });
    }

    // Validate category IDs and reject duplicates
    if (
      categoryIds.some((id) => !mongoose.isValidObjectId(id)) ||
      new Set(categoryIds.map(String)).size !== categoryIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Category IDs must be valid and unique",
      });
    }

    // req.user comes from auth middleware
    const instructorId = req.user.id;

    // Check whether all categories exist
    const existingCategories = await Category.find({
      _id: { $in: categoryIds },
    }).select("_id");

    if (existingCategories.length !== categoryIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more categories do not exist",
      });
    }

    // Validate thumbnail
    if (!req.files?.thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Course thumbnail is required",
      });
    }

    // Upload thumbnail to Cloudinary
    thumbnailImage = await uploadFileToCloudinary(req.files.thumbnail, {
      folder: process.env.FOLDER_NAME,
      resourceType: "image",
      height: 300,
      quality: "auto",
    });

    // Create course and update related documents transactionally
    const newCourse = await withTransaction(async (session) => {
      const [course] = await Course.create(
        [
          {
            courseName: courseName.trim(),
            courseDescription: courseDescription.trim(),
            price: Number(price),
            category: categoryIds,
            instructor: instructorId,
            thumbnail: thumbnailImage.secure_url,
            thumbnailPublicId: thumbnailImage.public_id,
          },
        ],
        { session },
      );

      // Update instructor's courses
      const updatedUser = await User.findByIdAndUpdate(
        instructorId,
        {
          $addToSet: { courses: course._id },
        },
        { session },
      );

      if (!updatedUser) {
        throw new Error("User not found");
      }

      // Update all selected categories
      const updatedCategories = await Category.updateMany(
        { _id: { $in: categoryIds } },
        {
          $addToSet: { courses: course._id },
        },
        { session },
      );

      if (updatedCategories.matchedCount !== categoryIds.length) {
        throw new Error("One or more categories were not found");
      }

      return course;
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error("Create course failed:", error);

    // Clean up thumbnail if course creation fails
    if (thumbnailImage?.public_id) {
      try {
        await deleteFileFromCloudinary(thumbnailImage.public_id, "image");
      } catch (cleanupError) {
        console.error(
          "Thumbnail cleanup failed:",
          thumbnailImage.public_id,
          cleanupError,
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Could not create course",
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate({
        path: "instructor",
        select: "-password",
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .populate("ratingAndReviews")
      .populate("category")
      .populate({
        path: "studentEnrolled",
        select: "firstName lastName email image",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Course data fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed while fetching course data",
    });
  }
};


export const updateCourse = async (req, res) => {
  let thumbnailImage;
  let databaseUpdateSucceeded = false;

  try {
    const {
      courseId,
      courseName,
      courseDescription,
      price,
      categoryId,
    } = req.body;

    // Validate course ID
    if (
      typeof courseId !== "string" ||
      !mongoose.isValidObjectId(courseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid course ID is required",
      });
    }

    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this course",
      });
    }

    // Prepare only the fields provided by the client
    const updatedData = {};
    let categoryIds;
    let categoriesProvided = false;

    // Course name
    if (courseName !== undefined) {
      if (
        typeof courseName !== "string" ||
        !courseName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Course name must be a non-empty string",
        });
      }

      updatedData.courseName = courseName.trim();
    }

    // Course description
    if (courseDescription !== undefined) {
      if (
        typeof courseDescription !== "string" ||
        !courseDescription.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Course description must be a non-empty string",
        });
      }

      updatedData.courseDescription = courseDescription.trim();
    }

    // Price
    if (price !== undefined) {
      if (
        price === null ||
        String(price).trim() === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number",
        });
      }

      updatedData.price = Number(price);
    }

    // Categories: parse and validate only when supplied
    if (categoryId !== undefined) {
      categoriesProvided = true;

      try {
        categoryIds =
          typeof categoryId === "string"
            ? JSON.parse(categoryId)
            : categoryId;
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId format",
        });
      }

      if (
        !Array.isArray(categoryIds) ||
        categoryIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "At least one category is required",
        });
      }

      if (
        categoryIds.some(
          (id) =>
            typeof id !== "string" ||
            !mongoose.isValidObjectId(id),
        ) ||
        new Set(categoryIds.map((id) => id.toLowerCase())).size !==
          categoryIds.length
      ) {
        return res.status(400).json({
          success: false,
          message: "Category IDs must be valid and unique",
        });
      }

      const existingCategories = await Category.find({
        _id: { $in: categoryIds },
      }).select("_id");

      if (existingCategories.length !== categoryIds.length) {
        return res.status(404).json({
          success: false,
          message: "One or more categories do not exist",
        });
      }

      updatedData.category = categoryIds;
    }

    // Upload a new thumbnail only if supplied
    if (req.files?.thumbnail) {
      thumbnailImage = await uploadFileToCloudinary(
        req.files.thumbnail,
        {
          folder: process.env.FOLDER_NAME,
          resourceType: "image",
          height: 300,
          quality: "auto",
        },
      );

      updatedData.thumbnail = thumbnailImage.secure_url;
      updatedData.thumbnailPublicId = thumbnailImage.public_id;
    }

    // Reject a request that contains no editable fields
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    // Update course and category references transactionally
    const updatedCourse = await withTransaction(async (session) => {
      const courseAfterUpdate = await Course.findByIdAndUpdate(
        courseId,
        { $set: updatedData },
        {
          session,
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!courseAfterUpdate) {
        throw new Error("Course not found during update");
      }

      // Only modify category relationships if categoryId was supplied
      if (categoriesProvided) {
        const updatedCategories = await Category.updateMany(
          { _id: { $in: categoryIds } },
          { $addToSet: { courses: courseAfterUpdate._id } },
          { session },
        );

        if (updatedCategories.matchedCount !== categoryIds.length) {
          throw new Error("One or more categories were not found");
        }

        // Remove the course from categories no longer selected
        await Category.updateMany(
          {
            _id: { $nin: categoryIds },
            courses: courseAfterUpdate._id,
          },
          { $pull: { courses: courseAfterUpdate._id } },
          { session },
        );
      }

      return courseAfterUpdate;
    });

    databaseUpdateSucceeded = true;

    // Delete the old thumbnail after the database update succeeds
    if (
      thumbnailImage?.public_id &&
      course.thumbnailPublicId &&
      thumbnailImage.public_id !== course.thumbnailPublicId
    ) {
      try {
        await deleteFileFromCloudinary(
          course.thumbnailPublicId,
          "image",
        );
      } catch (cleanupError) {
        console.error(
          "Old thumbnail cleanup failed:",
          cleanupError,
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Update course failed:", error);

    // If the DB update did not succeed, clean up the new upload
    if (!databaseUpdateSucceeded && thumbnailImage?.public_id) {
      try {
        await deleteFileFromCloudinary(
          thumbnailImage.public_id,
          "image",
        );
      } catch (cleanupError) {
        console.error(
          "New thumbnail cleanup failed:",
          cleanupError,
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Could not update course",
    });
  }
};


export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Validate course ID
    if (typeof courseId !== "string" || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "A valid course ID is required",
      });
    }

    // Find course and populate sections and subsections
    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify course ownership
    const instructorId = req.user.id;

    if (course.instructor.toString() !== instructorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this course",
      });
    }

    // Collect sections and subsections
    const sections = course.courseContent;
    const subSections = sections.flatMap((section) => section.subSection);

    const sectionIds = sections.map((section) => section._id);
    const subSectionIds = subSections.map((subSection) => subSection._id);

    // Collect Cloudinary asset deletion tasks.
    const assetDeletionTasks = [];
    for (const subSection of subSections) {
      if (subSection.videoPublicId) {
        assetDeletionTasks.push({
          publicId: subSection.videoPublicId,
          resourceType: "video",
        });
      }

      if (subSection.pdfPublicId) {
        assetDeletionTasks.push({
          publicId: subSection.pdfPublicId,
          resourceType: "raw",
        });
      }
    }

    if (course.thumbnailPublicId) {
      assetDeletionTasks.push({
        publicId: course.thumbnailPublicId,
        resourceType: "image",
      });
    }

    // Delete MongoDB records and references
    await withTransaction(async (session) => {
      await SubSection.deleteMany({ _id: { $in: subSectionIds } }, { session });

      await Section.deleteMany({ _id: { $in: sectionIds } }, { session });

      await User.updateOne(
        { _id: course.instructor },
        { $pull: { courses: course._id } },
        { session },
      );

      await Category.updateMany(
        { courses: course._id },
        { $pull: { courses: course._id } },
        { session },
      );

      const deletedCourse = await Course.findByIdAndDelete(course._id, {
        session,
      });

      if (!deletedCourse) {
        throw new Error("Course could not be deleted");
      }
    });

    const cleanupResults = await Promise.allSettled(
      assetDeletionTasks.map(({ publicId, resourceType }) =>
        deleteFileFromCloudinary(publicId, resourceType),
      ),
    );

    cleanupResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          "Cloudinary cleanup failed:",
          assetDeletionTasks[index].publicId,
          result.reason,
        );
      }
    });

    const cleanupFailed = cleanupResults.some(
      (result) => result.status === "rejected",
    );

    return res.status(200).json({
      success: true,
      message: cleanupFailed
        ? "Course deleted, but some uploaded assets could not be removed"
        : "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not delete course",
    });
  }
};
