import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryName:{
        type: String,
        unique: true,
        required: true,
        trim: true,
    },

    description:{
        type: String,
        trim: true,
        maxlength: 300,
    },
    courses:[
      {
        type:mongoose.Types.ObjectId,
        ref: "Course"
      }
    ]
  },
  {timestamps: true}
);

export const Category = mongoose.model("Category", categorySchema);
