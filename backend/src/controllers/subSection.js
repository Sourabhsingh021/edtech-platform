import mongoose from "mongoose";
import { SubSection } from "../models/subSection.js";
import { Section } from "../models/section.js";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../utils/fileUploader.js";
import { withTransaction } from "../utils/withTransaction.js";

// CREATE SUBSECTION
export const createSubSection = async (req, res) => {
  const uploadedAssets = [];

  try {
    const { title, timeDuration, description, sectionId } = req.body;

    if (
      typeof sectionId !== "string" ||
      !mongoose.isValidObjectId(sectionId) ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof timeDuration !== "string" ||
      !timeDuration.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All valid fields are required",
      });
    }

    const sectionExists = await Section.exists({ _id: sectionId });

    if (!sectionExists) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const data = {
      title: title.trim(),
      timeDuration: timeDuration.trim(),
      description: description.trim(),
    };

    const video = req.files?.video;
    const pdf = req.files?.pdf;

    if (video) {
      const uploadedVideo = await uploadFileToCloudinary(video, {
        folder: process.env.FOLDER_NAME,
        resourceType: "video",
      });

      uploadedAssets.push({
        publicId: uploadedVideo.public_id,
        resourceType: "video",
      });

      data.videoURL = uploadedVideo.secure_url;
      data.videoPublicId = uploadedVideo.public_id;
    }

    if (pdf) {
      const uploadedPdf = await uploadFileToCloudinary(pdf, {
        folder: process.env.FOLDER_NAME,
        resourceType: "raw",
      });

      uploadedAssets.push({
        publicId: uploadedPdf.public_id,
        resourceType: "raw",
      });

      data.pdfURL = uploadedPdf.secure_url;
      data.pdfPublicId = uploadedPdf.public_id;
    }

    const result = await withTransaction(async (session) => {
      // Recheck the section within the transaction.
      const section = await Section.findById(sectionId).session(session);

      if (!section) {
        const error = new Error("Section not found");
        error.code = "SECTION_NOT_FOUND";
        throw error;
      }

      const [subSection] = await SubSection.create([data], { session });

      const updatedSection = await Section.findByIdAndUpdate(
        sectionId,
        { $push: { subSection: subSection._id } },
        { returnDocument: "after", session },
      );

      if (!updatedSection) {
        throw new Error("Section update failed");
      }

      return subSection;
    });

    return res.status(201).json({
      success: true,
      message: "SubSection created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create subsection error:", error);

    // If the database transaction failed, clean up uploaded assets.
    // Cleanup failures should be logged and retried separately.
    const cleanupResults = await Promise.allSettled(
      uploadedAssets.map(({ publicId, resourceType }) =>
        deleteFileFromCloudinary(publicId, resourceType),
      ),
    );

    const cleanupFailures = cleanupResults.filter(
      (result) => result.status === "rejected",
    );

    if (cleanupFailures.length > 0) {
      console.error("Failed to clean up uploaded assets:", cleanupFailures);
    }

    if (error.code === "SECTION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Could not create SubSection",
    });
  }
};

// UPDATE SUBSECTION

export const updateSubSection = async (req, res) => {
  let uploadedVideo;
  let uploadedPdf;
  let databaseUpdateSucceeded = false;

  try {
    const { subSectionId, title, timeDuration, description } = req.body;

    //Validate subsection ID
    if (
      typeof subSectionId !== "string" ||
      !mongoose.isValidObjectId(subSectionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid subsection ID is required",
      });
    }

    // Find existing subsection
    const oldSubSection = await SubSection.findById(subSectionId);

    if (!oldSubSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // Prepare only supplied fields
    const updateData = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title must be a non-empty string",
        });
      }

      updateData.title = title.trim();
    }

    if (timeDuration !== undefined) {
      if (typeof timeDuration !== "string" || !timeDuration.trim()) {
        return res.status(400).json({
          success: false,
          message: "Time duration must be a non-empty string",
        });
      }

      updateData.timeDuration = timeDuration.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description must be a non-empty string",
        });
      }

      updateData.description = description.trim();
    }

    //Handle optional video upload
    const video = req.files?.video;

    if (video) {
      uploadedVideo = await uploadFileToCloudinary(video, {
        folder: process.env.FOLDER_NAME,
        resourceType: "video",
      });

      updateData.videoURL = uploadedVideo.secure_url;
      updateData.videoPublicId = uploadedVideo.public_id;
    }

    // Handle optional PDF upload
    const pdf = req.files?.pdf;

    if (pdf) {
      uploadedPdf = await uploadFileToCloudinary(pdf, {
        folder: process.env.FOLDER_NAME,
        resourceType: "raw",
      });

      updateData.pdfURL = uploadedPdf.secure_url;
      updateData.pdfPublicId = uploadedPdf.public_id;
    }

    // Reject empty updates
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field or file to update",
      });
    }

    // Update only the supplied fields
    const updatedSubSection = await SubSection.findByIdAndUpdate(
      subSectionId,
      { $set: updateData },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).exec();

    if (!updatedSubSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    databaseUpdateSucceeded = true;

    // Remove replaced files after successful database update
    if (
      uploadedVideo &&
      oldSubSection.videoPublicId &&
      uploadedVideo.public_id !== oldSubSection.videoPublicId
    ) {
      try {
        await deleteFileFromCloudinary(oldSubSection.videoPublicId, "video");
      } catch (error) {
        console.error("Old video cleanup failed:", error);
      }
    }

    if (
      uploadedPdf &&
      oldSubSection.pdfPublicId &&
      uploadedPdf.public_id !== oldSubSection.pdfPublicId
    ) {
      try {
        await deleteFileFromCloudinary(oldSubSection.pdfPublicId, "raw");
      } catch (error) {
        console.error("Old PDF cleanup failed:", error);
      }
    }

    return res.status(200).json({
      success: true,
      message: "SubSection updated successfully",
      data: updatedSubSection,
    });
  } catch (error) {
    console.error("Update subsection error:", error);

    // Clean up newly uploaded files if the DB update failed
    if (!databaseUpdateSucceeded) {
      if (uploadedVideo?.public_id) {
        try {
          await deleteFileFromCloudinary(uploadedVideo.public_id, "video");
        } catch (cleanupError) {
          console.error("New video cleanup failed:", cleanupError);
        }
      }

      if (uploadedPdf?.public_id) {
        try {
          await deleteFileFromCloudinary(uploadedPdf.public_id, "raw");
        } catch (cleanupError) {
          console.error("New PDF cleanup failed:", cleanupError);
        }
      }
    }

    return res.status(500).json({
      success: false,
      message: "Could not update SubSection",
    });
  }
};

// DELETE SUBSECTION
export const deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;

    if (
      typeof subSectionId !== "string" ||
      !mongoose.isValidObjectId(subSectionId) ||
      typeof sectionId !== "string" ||
      !mongoose.isValidObjectId(sectionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid subsection ID and section ID are required",
      });
    }

    // Return Cloudinary IDs for cleanup after the transaction commits.
    const assets = await withTransaction(async (session) => {
      const section = await Section.findById(sectionId).session(session);

      if (!section) {
        const error = new Error("Section not found");
        error.code = "SECTION_NOT_FOUND";
        throw error;
      }

      const belongsToSection = section.subSection.some(
        (id) => id.toString() === subSectionId,
      );

      if (!belongsToSection) {
        const error = new Error("SubSection does not belong to section");
        error.code = "SUBSECTION_NOT_IN_SECTION";
        throw error;
      }

      const subSection =
        await SubSection.findById(subSectionId).session(session);

      if (!subSection) {
        const error = new Error("SubSection not found");
        error.code = "SUBSECTION_NOT_FOUND";
        throw error;
      }

      const assetIds = [];

      if (subSection.videoPublicId) {
        assetIds.push({
          publicId: subSection.videoPublicId,
          resourceType: "video",
        });
      }

      if (subSection.pdfPublicId) {
        assetIds.push({
          publicId: subSection.pdfPublicId,
          resourceType: "raw",
        });
      }

      const deletedSubSection = await SubSection.findByIdAndDelete(
        subSectionId,
        { session },
      );

      if (!deletedSubSection) {
        throw new Error("SubSection deletion failed");
      }

      const updatedSection = await Section.findByIdAndUpdate(
        sectionId,
        { $pull: { subSection: subSectionId } },
        { returnDocument: "after", session },
      );

      if (!updatedSection) {
        throw new Error("Section update failed");
      }

      return assetIds;
    });

    const assetResults = await Promise.allSettled(
      assets.map(({ publicId, resourceType }) =>
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

    return res.status(200).json({
      success: true,
      message:
        failedDeletions.length > 0
          ? "SubSection deleted, but some Cloudinary assets could not be deleted"
          : "SubSection deleted successfully",
    });
  } catch (error) {
    console.error("Delete subsection error:", error);

    if (error.code === "SECTION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    if (error.code === "SUBSECTION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (error.code === "SUBSECTION_NOT_IN_SECTION") {
      return res.status(400).json({
        success: false,
        message: "SubSection does not belong to this section",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Could not delete SubSection",
    });
  }
};
