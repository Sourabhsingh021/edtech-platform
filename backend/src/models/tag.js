import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    tagName:{
        type: String,
        unique: true,
        required: true,
        trim: true,
    },

    descriptions:{
        type: String,
        trim: true,
        maxlength: 300,
    },
  },
  {timestamps: true}
);

export const Tag = mongoose.model("Tag", tagSchema);
