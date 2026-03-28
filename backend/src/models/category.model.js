import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        unique: true, // Prevents duplicate categories like "Electronics" and "Electronics"
        maxLength: [50, "Category name cannot exceed 50 characters"]
    },
    
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true // Crucial for fast URL-based lookups (e.g., /category/mens-fashion)
    },

    description: {
        type: String,
        trim: true
    },

    image: {
        type: String, // URL to the category icon/banner
        default: ""
    },

    // --- HIERARCHY LOGIC ---
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        default: null // If null, this is a Top-Level category (e.g., "Electronics")
    },

    // Useful for showing "Electronics > Mobile > iPhones" without multiple DB queries
    level: {
        type: Number,
        default: 0 // 0 for Root, 1 for Sub-category, 2 for Sub-sub-category
    },

    isActive: {
        type: Boolean,
        default: true // Admins can hide entire categories if needed
    }
}, { timestamps: true });

// Middleware to automatically generate level based on parent
categorySchema.pre('save', async function() {
    if (this.parentCategory) {
        const parent = await mongoose.model("Category").findById(this.parentCategory);
        if (parent) {
            this.level = parent.level + 1;
        }
    } else {
        this.level = 0;
    }
});

export const Category = mongoose.model("Category", categorySchema);