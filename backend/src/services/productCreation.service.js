import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";

export const parseMaybeJSON = (value, fallback = null) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const buildProductSku = ({ productName, brand, variant }) => {
    const nameSource = String(productName || brand || "PRD")
        .substring(0, 3)
        .toUpperCase()
        .replace(/\s/g, "");

    const attributeValue = variant?.attributes
        ? String(Object.values(variant.attributes)[0] || "VAR")
        : "VAR";

    const attrSource = attributeValue.substring(0, 3).toUpperCase().replace(/\s/g, "");
    const randomID = Math.floor(1000 + Math.random() * 9000);

    return `${nameSource}-${attrSource}-${randomID}`;
};

export const normalizeProductVariant = ({ variant, productName, brand }) => {
    const normalizedVariant = { ...variant };
    normalizedVariant.attributes = parseMaybeJSON(normalizedVariant.attributes, {});

    if (
        !normalizedVariant.attributes ||
        typeof normalizedVariant.attributes !== "object" ||
        Array.isArray(normalizedVariant.attributes)
    ) {
        throw new ApiError(400, "Each variant must include valid attributes");
    }

    normalizedVariant.productPrice = Number(normalizedVariant.productPrice);
    normalizedVariant.discountPercentage = Number(normalizedVariant.discountPercentage || 0);
    normalizedVariant.productStock = Number(normalizedVariant.productStock);

    if (!Number.isFinite(normalizedVariant.productPrice) || normalizedVariant.productPrice < 0) {
        throw new ApiError(400, "Each variant must include a valid productPrice");
    }

    if (!Number.isFinite(normalizedVariant.productStock) || normalizedVariant.productStock < 0) {
        throw new ApiError(400, "Each variant must include a valid productStock");
    }

    if (
        Number.isFinite(normalizedVariant.discountPercentage) &&
        (normalizedVariant.discountPercentage < 0 || normalizedVariant.discountPercentage > 100)
    ) {
        throw new ApiError(400, "Variant discount must be between 0 and 100");
    }

    if (!normalizedVariant.sku) {
        normalizedVariant.sku = buildProductSku({ productName, brand, variant: normalizedVariant });
    } else {
        normalizedVariant.sku = String(normalizedVariant.sku).trim().toUpperCase();
    }

    return normalizedVariant;
};

export const createProductRecord = async ({
    productName,
    productDescription,
    brand = "Generic",
    category,
    variants,
    variantOptions,
    mainImages,
    variantImages = [],
    isActive = true
}) => {
    if (!mongoose.Types.ObjectId.isValid(category)) {
        throw new ApiError(400, "Invalid category ID");
    }

    if (!productName?.trim() || !productDescription?.trim() || !category) {
        throw new ApiError(400, "Required fields are missing");
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        throw new ApiError(404, "Category not found");
    }

    if (!Array.isArray(mainImages) || mainImages.length === 0) {
        throw new ApiError(400, "At least one main product image is required");
    }

    const parsedVariants = parseMaybeJSON(variants, []);
    const parsedOptions = parseMaybeJSON(variantOptions, []);

    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
        throw new ApiError(400, "At least one variant is required");
    }

    const mainImageUrls = (await Promise.all(
        mainImages.map(async (file) => {
            const uploaded = await uploadOnCloudinary(file.path);
            return uploaded?.url;
        })
    )).filter(Boolean);

    if (mainImageUrls.length === 0) {
        throw new ApiError(400, "Failed to upload product images");
    }

    const uploadedVariantImages = await Promise.all(
        variantImages.map(async (file) => {
            const uploaded = await uploadOnCloudinary(file.path);
            return uploaded?.url;
        })
    );

    const finalVariants = parsedVariants.map((variant) => {
        const normalizedVariant = normalizeProductVariant({
            variant,
            productName,
            brand
        });

        if (
            normalizedVariant.imageRef !== undefined &&
            uploadedVariantImages[normalizedVariant.imageRef]
        ) {
            normalizedVariant.variantImage = uploadedVariantImages[normalizedVariant.imageRef];
        }

        return normalizedVariant;
    });

    return Product.create({
        productName,
        productDescription,
        brand,
        category,
        mainImages: mainImageUrls,
        variantOptions: parsedOptions,
        variants: finalVariants,
        isActive
    });
};
