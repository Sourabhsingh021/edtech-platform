import { cloudinary } from "../config/cloudinary.js";

export const uploadFileToCloudinary = async (
  file,
  { folder, height, quality, publicId, resourceType = "auto" } = {},
) => {
  try {
    const options = {
      resource_type: resourceType,
    };

    if (folder) options.folder = folder;
    if (height) options.height = height;
    if (quality) options.quality = quality;

    if (publicId) {
      options.public_id = publicId;
      options.overwrite = true;
      options.invalidate = true;
    }

    return await cloudinary.uploader.upload(file.tempFilePath, options);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export const deleteFileFromCloudinary = async(publicId, resource_type="image" ) => {
  try {
    const options = {
      invalidate: true,
      resource_type: resource_type
    }

    return await cloudinary.uploader.destroy(publicId, options)
  } catch (error) {
    console.error("Cloudinary deletion  error:", error);
    throw error;
  }
};
