import mongoose from "mongoose";
import { Wishlist } from "../models/wishlist.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildSkippedItem, isValidObjectId, normalizeGuestWishlistItems } from "../utils/guestMerge.utils.js";

const wishlistProductProjection = "productName mainImages basePrice variants isActive";

const toggleWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product id");
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const wishlist = await ensureWishlist(userId);
    const hasProduct = wishlist.products.some((item) => item.equals(productId));

    const update = hasProduct
        ? { $pull: { products: productId } }
        : { $addToSet: { products: productId } };

    const updatedWishlist = await Wishlist.findOneAndUpdate(
        { owner: userId },
        update,
        { new: true, runValidators: true }
    ).populate("products", wishlistProductProjection);

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedWishlist,
            hasProduct ? "Removed from wishlist" : "Added to wishlist"
        )
    );
});

const getUserWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ owner: req.user._id })
        .populate("products", wishlistProductProjection);

    if (!wishlist) {
        return res.status(200).json(
            new ApiResponse(200, { owner: req.user._id, products: [] }, "Wishlist is empty")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, wishlist, "Wishlist fetched successfully")
    );
});

const getCustomerWishlistForVendor = asyncHandler(async (req, res) => {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ApiError(400, "Invalid customer id");
    }

    const wishlist = await Wishlist.findOne({ owner: customerId })
        .populate("products", wishlistProductProjection);

    if (!wishlist) {
        return res.status(200).json(
            new ApiResponse(200, { owner: customerId, products: [] }, "Customer wishlist is empty")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, wishlist, "Customer wishlist fetched successfully")
    );
});

async function ensureWishlist(userId) {
    try {
        return await Wishlist.findOneAndUpdate(
            { owner: userId },
            { $setOnInsert: { owner: userId, products: [] } },
            { new: true, upsert: true, runValidators: true }
        );
    } catch (error) {
        if (error?.code === 11000) {
            const wishlist = await Wishlist.findOne({ owner: userId });
            if (wishlist) {
                return wishlist;
            }
        }

        throw error;
    }
}

const mergeGuestWishlist = asyncHandler(async (req, res) => {
    const { items } = req.body || {};
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (!Array.isArray(items)) {
        throw new ApiError(400, "items must be an array");
    }

    const guestItems = normalizeGuestWishlistItems(items);
    const skippedItems = [];
    const wishlist = await ensureWishlist(userId);

    if (guestItems.length === 0) {
        const populatedWishlist = await Wishlist.findById(wishlist._id).populate("products", wishlistProductProjection);
        return res.status(200).json(
            Object.assign(
                new ApiResponse(200, populatedWishlist, "Guest wishlist merged successfully"),
                { skippedItems: [] }
            )
        );
    }

    for (const guestItem of guestItems) {
        const { productId, variantId } = guestItem;

        if (!isValidObjectId(productId)) {
            skippedItems.push(buildSkippedItem(productId, variantId, "Invalid product id"));
            continue;
        }

        const product = await Product.findById(productId).select("_id isActive");
        if (!product || product.isActive === false) {
            skippedItems.push(buildSkippedItem(productId, variantId, "Product unavailable"));
            continue;
        }

        const alreadySaved = wishlist.products.some((item) => item.equals(productId));
        if (alreadySaved) {
            skippedItems.push(buildSkippedItem(productId, variantId, "Already in wishlist"));
            continue;
        }

        wishlist.products.push(productId);
    }

    await wishlist.save();
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate("products", wishlistProductProjection);

    return res.status(200).json(
        Object.assign(
            new ApiResponse(200, populatedWishlist, "Guest wishlist merged successfully"),
            { skippedItems }
        )
    );
});

export { toggleWishlist, getUserWishlist, getCustomerWishlistForVendor, mergeGuestWishlist };
