import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {Vendor} from "../models/vendor.model.js"
import {Product} from "../models/product.model.js"
import { createProductRecord } from "../services/productCreation.service.js";

const normalizeBoolean = (value, fallback = true) => {
    if (typeof value === "undefined") {
        return fallback;
    }

    if (typeof value === "string") {
        return !["false", "0", "no"].includes(value.trim().toLowerCase());
    }

    return Boolean(value);
};

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Important: Check Whether admin should not delete himself.
    if (user._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot delete your own admin account");
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json(
        new ApiResponse(200, null, "User deleted successfully")
    );
});

const deleteVendorAndProducts = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    // 1. Delete all products associated with this vendor
    await Product.deleteMany({ vendor: vendorId });

    // 2. Delete the Vendor Profile
    await Vendor.findByIdAndDelete(vendorId);

    // 3. Optional: Update User Role (Vendor role hata dena)
    await User.findByIdAndUpdate(vendor.user, {
        $pull: { role: "vendor" } 
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Vendor and all their products have been removed")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const skip = (page - 1) * limit;

    
    const users = await User.find()
        .select("-password -refreshToken")
        .sort("-createdAt") // New users pehle dikhein
        .skip(skip)
        .limit(limit);

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }, "Users fetched with pagination")
    );
});

const createProductForVendor = asyncHandler(async (req, res) => {
    const {
        vendorId,
        isActive,
        ...productData
    } = req.body;

    if (!vendorId) {
        throw new ApiError(400, "vendorId is required");
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");
    if (vendor.verificationStatus !== "approved") {
        throw new ApiError(403, "Products can only be assigned to approved vendors");
    }

    const product = await createProductRecord({
        ...productData,
        vendorId: vendor._id,
        mainImages: req.files?.mainImages || [],
        variantImages: req.files?.variantImages || [],
        isActive: normalizeBoolean(isActive, true)
    });

    return res.status(201).json(
        new ApiResponse(201, product, "Product created for vendor successfully")
    );
});

const deleteProductByAdmin = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    await Product.findByIdAndDelete(productId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Product deleted by admin successfully")
    );
});

const toggleProductStatusByAdmin = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive === "undefined") {
        throw new ApiError(400, "isActive is required");
    }

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    product.isActive = normalizeBoolean(isActive, product.isActive);

    const updatedProduct = await product.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product status updated successfully")
    );
});

export {
    deleteUser,
    deleteVendorAndProducts,
    getAllUsers,
    createProductForVendor,
    deleteProductByAdmin,
    toggleProductStatusByAdmin
}
