import { Category } from "../models/category.js";

export const createCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    if (
      typeof categoryName !== "string" ||
      !categoryName.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Category name and description are required text fields.",
      });
    }

    const category = await Category.create({
      categoryName: categoryName.trim(),
      description: description.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { categoryName: 1, description: 1 },
    );

    return res.status(200).json({
      success: true,
      message: "All categories retrieved successfully",
      data: allCategories,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
