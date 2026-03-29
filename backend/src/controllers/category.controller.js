import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinaryUpload.js"
import slugify from "slugify"; 

// --- HELPER FUNCTION: Recursive Tree Builder ---  coded from Gemini 

const buildCategoryTree = (categories, parentId = null) => {
    const categoryList = [];
    let filter;
    
    if (parentId == null) {
        filter = categories.filter(cat => cat.parentCategory == undefined);
    } else {
        filter = categories.filter(cat => String(cat.parentCategory) === String(parentId));
    }

    for (let cat of filter) {
        categoryList.push({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            level: cat.level,
            children: buildCategoryTree(categories, cat._id)
        });
    }
    return categoryList;
};

// 1. Create Category 

const createCategory = asyncHandler(async (req, res) => {
    const { name, description, parentCategory } = req.body;

    if (!name) throw new ApiError(400, "Category name is required");

    const slug = slugify(name, { lower: true, strict: true });

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) throw new ApiError(400, "Category with this name already exists");

    const imageLocalPath = req.file?.path

    if(!imageLocalPath){
        throw new ApiError(400, "Error uploading Image")
    }

    const imagePath = await uploadOnCloudinary(imageLocalPath)

    if(!imagePath.url){
        throw new ApiError(400, "Error uploading image to cloudinary")
    }

    const category = await Category.create({
        name,
        description,
        slug,
        parentCategory: parentCategory || null,
        image: imagePath.url
    });

    return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

// 2. Get Full Category Tree (Public - for Navbar/Menus)

const getCategoryTree = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true });
    const categoryTree = buildCategoryTree(categories);

    return res.status(200).json(new ApiResponse(200, categoryTree, "Category tree fetched"));
});

// 3. Get All Active Categories (Public - for landing page cards/sections)
const getAllCategoriesForLandingPage = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true })
        .select("name slug image level parentCategory")
        .sort({ level: 1, name: 1 });

    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched for landing page")
    );
});

// 3. Get Direct Sub-Categories (Public - for filters)

const getSubCategories = asyncHandler(async (req, res) => {
    const { parentId } = req.params;
    
    // If parentId is "root", find categories with no parent
    const query = {
        parentCategory: parentId === "root" ? null : parentId,
        isActive: true 
    };
    
    const subCategories = await Category.find(query);
    return res.status(200).json(new ApiResponse(200, subCategories, "Sub-categories fetched"));
});

// 4. Update Category (Admin Only)

const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name, description, parentCategory, isActive } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) throw new ApiError(404, "Category not found");

    if (name) {
        category.name = name;
        category.slug = slugify(name, { lower: true, strict: true });
    }
    
    if (description) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;
    
    // If moving to a new parent, the pre-save hook handles the 'level' update
    if (parentCategory !== undefined) {
        category.parentCategory = parentCategory || null;
    }

    await category.save();

    return res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

// 5. Delete Category (Admin Only)

const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    // Check if it has children first to prevent "orphaned" sub-categories
    const hasChildren = await Category.findOne({ parentCategory: categoryId });
    if (hasChildren) {
        throw new ApiError(400, "Cannot delete category with sub-categories. Delete children first.");
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) throw new ApiError(404, "Category not found");

    return res.status(200).json(new ApiResponse(200, null, "Category deleted successfully"));
});

export {
    createCategory,
    getCategoryTree,
    getAllCategoriesForLandingPage,
    getSubCategories,
    updateCategory,
    deleteCategory
};
