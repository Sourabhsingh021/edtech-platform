import { Section } from "../models/section.js";
import { Course } from "../models/course.js";
import { deleteFileFromCloudinary } from "../utils/fileUploader.js";
import { SubSection } from "../models/subSection.js";
import mongoose from "mongoose";
import { withTransaction } from "../utils/withTransaction.js";

export const createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    if (
      typeof sectionName !== "string" ||
      !sectionName.trim() ||
      typeof courseId !== "string" ||
      !mongoose.isValidObjectId(courseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid section name and course ID are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const result = await withTransaction(async (session) => {
      const [section] = await Section.create(
        [
          {
            sectionName: sectionName.trim(),
          },
        ],
        { session },
      );

      const updatedCourseDetails = await Course.findByIdAndUpdate(
        courseId,
        { $push: { courseContent: section._id } },
        { returnDocument: "after", session },
      );

      if (!updatedCourseDetails) {
        throw new Error("Course update failed");
      }

      return section;
    });

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not create section",
    });
  }
};

export const updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;

    if (
      typeof sectionName !== "string" ||
      !sectionName.trim() ||
      typeof sectionId !== "string" ||
      !mongoose.isValidObjectId(sectionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Section name and section ID are required",
      });
    }


    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName: sectionName.trim() },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not update section",
    });
  }
};


export const deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;

    //Validate IDs
    if (
      typeof sectionId !== "string" ||
      !mongoose.isValidObjectId(sectionId) ||
      typeof courseId !== "string" ||
      !mongoose.isValidObjectId(courseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid section ID and course ID are required",
      });
    }

    // Perform all MongoDB changes in one transaction
    const assetPublicIds = await withTransaction(async (session) => {
      // Find course
      const course = await Course.findById(courseId).session(session);

      if (!course) {
        throw new Error("COURSE_NOT_FOUND");
      }

      // Verify section belongs to this course
      const belongsToCourse = course.courseContent.some(
        (id) => id.toString() === sectionId,
      );

      if (!belongsToCourse) {
        throw new Error("SECTION_NOT_IN_COURSE");
      }

      // Find section and populate subsections
      const section = await Section.findById(sectionId)
        .populate("subSection")
        .session(session)
        .exec();

      if (!section) {
        throw new Error("SECTION_NOT_FOUND");
      }

      // Collect Cloudinary asset IDs before deleting database records
      const assets = section.subSection.flatMap((subSection) => {
        const tasks = [];

        if (subSection.videoPublicId) {
          tasks.push({
            publicId: subSection.videoPublicId,
            resourceType: "video",
          });
        }

        if (subSection.pdfPublicId) {
          tasks.push({
            publicId: subSection.pdfPublicId,
            resourceType: "raw",
          });
        }

        return tasks;
      });

      // Delete subsection documents
      const subSectionIds = section.subSection.map(
        (subSection) => subSection._id,
      );

      if (subSectionIds.length > 0) {
        await SubSection.deleteMany(
          { _id: { $in: subSectionIds } },
          { session },
        );
      }

      // Remove section reference from course
      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { $pull: { courseContent: sectionId } },
        { returnDocument: "after", session },
      );

      if (!updatedCourse) {
        throw new Error("COURSE_UPDATE_FAILED");
      }

      // Delete section document
      const deletedSection = await Section.findByIdAndDelete(
        sectionId,
        { session },
      );

      if (!deletedSection) {
        throw new Error("SECTION_DELETE_FAILED");
      }

      // Return asset information after the transaction commits
      return assets;
    });

    // 3. Delete Cloudinary assets only after MongoDB commits
    const assetResults = await Promise.allSettled(
      assetPublicIds.map(({ publicId, resourceType }) =>
        deleteFileFromCloudinary(publicId, resourceType),
      ),
    );

    const failedDeletions = assetResults.filter(
      (result) => result.status === "rejected",
    );

    if (failedDeletions.length > 0) {
      console.error(
        "Some Cloudinary assets could not be deleted:",
        failedDeletions,
      );
    }

    // Send response
    return res.status(200).json({
      success: true,
      message:
        failedDeletions.length > 0
          ? "Section deleted, but some Cloudinary assets could not be deleted"
          : "Section deleted successfully",
    });
  } catch (error) {
    console.error("Delete section error:", error);

    // Handle expected errors
    if (error.message === "COURSE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (error.message === "SECTION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    if (error.message === "SECTION_NOT_IN_COURSE") {
      return res.status(400).json({
        success: false,
        message: "Section does not belong to this course",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Could not delete section",
    });
  }
};
