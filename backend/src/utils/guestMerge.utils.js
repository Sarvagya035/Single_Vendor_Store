import mongoose from "mongoose";

const normalizeObjectId = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const buildCartItemKey = (productId, variantId) => `${normalizeObjectId(productId)}::${normalizeObjectId(variantId)}`;

const buildWishlistItemKey = (productId, variantId = "") => `${normalizeObjectId(productId)}::${normalizeObjectId(variantId)}`;

const normalizeGuestCartItems = (items = []) => {
    const normalized = new Map();

    if (!Array.isArray(items)) {
        return [];
    }

    for (const item of items) {
        const productId = normalizeObjectId(item?.productId);
        const variantId = normalizeObjectId(item?.variantId);
        const quantity = Math.max(1, Math.floor(Number(item?.quantity) || 0));

        if (!productId || !variantId || !quantity) {
            continue;
        }

        const key = buildCartItemKey(productId, variantId);
        const current = normalized.get(key);

        if (current) {
            current.quantity += quantity;
            continue;
        }

        normalized.set(key, {
            productId,
            variantId,
            quantity
        });
    }

    return Array.from(normalized.values());
};

const normalizeGuestWishlistItems = (items = []) => {
    const normalized = new Map();

    if (!Array.isArray(items)) {
        return [];
    }

    for (const item of items) {
        const productId = normalizeObjectId(item?.productId);
        const variantId = normalizeObjectId(item?.variantId);

        if (!productId) {
            continue;
        }

        const key = buildWishlistItemKey(productId, variantId);

        if (normalized.has(key)) {
            continue;
        }

        normalized.set(key, {
            productId,
            variantId: variantId || undefined
        });
    }

    return Array.from(normalized.values());
};

const buildSkippedItem = (productId, variantId, reason) => ({
    productId,
    variantId,
    reason
});

export {
    buildCartItemKey,
    buildWishlistItemKey,
    buildSkippedItem,
    isValidObjectId,
    normalizeGuestCartItems,
    normalizeGuestWishlistItems
};
