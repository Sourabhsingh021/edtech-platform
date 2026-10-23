import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    dateOfBirth: {
      type: Date,
    },

    about: {
      type: String,
      maxlength: 500,
    },

    contactNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Profile = mongoose.model("Profile", profileSchema);
