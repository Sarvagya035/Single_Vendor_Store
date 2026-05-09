import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Wishlist } from "../models/wishlist.model.js";
import { Product } from "../models/product.model.js";
import {
    buildSkippedItem,
    isValidObjectId,
    normalizeGuestWishlistItems
} from "../utils/guestMerge.utils.js";

const wishlistProductProjection = "productName mainImages basePrice variants isActive";

const ensureWishlist = async (userId) => {
    return Wishlist.findOneAndUpdate(
        { owner: userId },
        { $setOnInsert: { owner: userId, products: [] } },
        { new: true, upsert: true, runValidators: true }
    );
};

// Toggle product in wishlist (Add if not present, Remove if present)
const toggleWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product || product.isActive === false) {
        throw new ApiError(404, "Product not found");
    }

    const wishlist = await ensureWishlist(userId);
    const isAdded = wishlist.products.some((item) => String(item) === String(productId));

    if (isAdded) {
        wishlist.products.pull(productId);
    } else {
        wishlist.products.push(productId);
    }

    await wishlist.save();
    await wishlist.populate("products", wishlistProductProjection);

    return res.status(200).json(
        new ApiResponse(
            200,
            wishlist,
            isAdded ? "Removed from wishlist" : "Added to wishlist"
        )
    );
});

const getUserWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ owner: req.user._id })
        .populate("products", wishlistProductProjection);

    if (!wishlist) {
        return res.status(200).json(new ApiResponse(200, { products: [] }, "Wishlist is empty"));
    }

    return res.status(200).json(new ApiResponse(200, wishlist, "Wishlist fetched successfully"));
});

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
        await wishlist.populate("products", wishlistProductProjection);
        return res.status(200).json(
            Object.assign(
                new ApiResponse(200, wishlist, "Guest wishlist merged successfully"),
                { skippedItems: [] }
            )
        );
    }

    const existingProductIds = new Set(wishlist.products.map((item) => String(item)));

    for (const guestItem of guestItems) {
        const { productId, variantId } = guestItem;

        if (!isValidObjectId(productId)) {
            skippedItems.push(buildSkippedItem(productId, variantId, "Invalid product id"));
            continue;
        }

        if (existingProductIds.has(String(productId))) {
            continue;
        }

        const product = await Product.findById(productId);
        if (!product || product.isActive === false) {
            skippedItems.push(buildSkippedItem(productId, variantId, "Product unavailable"));
            continue;
        }

        if (variantId) {
            if (!isValidObjectId(variantId)) {
                skippedItems.push(buildSkippedItem(productId, variantId, "Invalid variant id"));
                continue;
            }

            const variant = product.variants.id(variantId);
            if (!variant || variant.isAvailable === false || Number(variant.productStock || 0) <= 0) {
                skippedItems.push(buildSkippedItem(productId, variantId, "Variant unavailable"));
                continue;
            }
        }

        wishlist.products.push(productId);
        existingProductIds.add(String(productId));
    }

    await wishlist.save();
    await wishlist.populate("products", wishlistProductProjection);

    return res.status(200).json(
        Object.assign(
            new ApiResponse(200, wishlist, "Guest wishlist merged successfully"),
            { skippedItems }
        )
    );
});

const getCustomerWishlistForVendor = asyncHandler(async (req, res) => {
    const { customerId } = req.params;

    const wishlist = await Wishlist.findOne({ owner: customerId })
        .populate("products", wishlistProductProjection);

    if (!wishlist) {
        return res.status(200).json(new ApiResponse(200, { products: [] }, "Wishlist is empty"));
    }

    return res.status(200).json(new ApiResponse(200, wishlist, "Customer wishlist fetched successfully"));
});

export { toggleWishlist, getUserWishlist, mergeGuestWishlist, getCustomerWishlistForVendor };
