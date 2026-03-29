import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import { createProductRecord } from "../services/productCreation.service.js";

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    // 4. Delete from DB
    await Product.findByIdAndDelete(productId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Product and associated assets deleted successfully")
    );
});

const updateProductDetails = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { productName, productDescription, brand, category, isActive } = req.body;

    //at lease one field must be there for update

    if (!productName && !productDescription && !brand && !category && typeof isActive === 'undefined') {
        throw new ApiError(400, "No fields provided for update");
    }

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    if (productName) product.productName = productName.trim();
    if (productDescription) product.productDescription = productDescription.trim();
    if (brand) product.brand = brand.trim();
    
    if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) throw new ApiError(404, "Category not found");
        product.category = category;
    }

    if (typeof isActive !== 'undefined') {
        product.isActive = isActive;
    }

    const updatedProduct = await product.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product details updated successfully")
    );
});

const createProductByAdmin = asyncHandler(async (req, res) => {
    const product = await createProductRecord({
        ...req.body,
        mainImages: req.files?.mainImages || [],
        variantImages: req.files?.variantImages || [],
        isActive: req.body?.isActive
    });

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
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

    product.isActive = typeof isActive === "string"
        ? !["false", "0", "no"].includes(isActive.trim().toLowerCase())
        : Boolean(isActive);

    const updatedProduct = await product.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product status updated successfully")
    );
});

const searchProductsDeep = asyncHandler(async (req, res) => {
    const { q, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    if (!q) throw new ApiError(400, "Search query is required");

    const searchWords = q.trim().split(/[\s,-]+/).filter(word => word.length > 0);
    const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixPattern = searchWords.map(escapeRegex).join("|");

    const pipeline = [
        { $match: { isActive: true } },
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        {
            $unwind: {
                path: "$categoryDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $match: {
                $or: [
                    { productName: { $regex: `^(${prefixPattern})`, $options: "i" } },
                    { brand: { $regex: `^(${prefixPattern})`, $options: "i" } },
                    { "variants.sku": { $regex: `^(${prefixPattern})`, $options: "i" } },
                    { "variants.attributes.$**": { $regex: `^(${prefixPattern})`, $options: "i" } },
                    { "categoryDetails.name": { $regex: `^(${prefixPattern})`, $options: "i" } },
                    { "categoryDetails.slug": { $regex: `^(${prefixPattern})`, $options: "i" } }
                ]
            }
        }
    ];

    // Category & Price Filters
    if (category) {
        pipeline.push({ $match: { category: new mongoose.Types.ObjectId(category) } });
    }

    if (minPrice || maxPrice) {
        const priceQuery = {};
        if (minPrice) priceQuery.$gte = Number(minPrice);
        if (maxPrice) priceQuery.$lte = Number(maxPrice);
        pipeline.push({ $match: { basePrice: priceQuery } });
    }

    // --- STEP 3: Smart Variant Selection (Filtering inside the matched product) ---
    pipeline.push({
        $addFields: {
            displayVariant: {
                $let: {
                    vars: {
                        matched: {
                            $filter: {
                                input: "$variants",
                                as: "v",
                                cond: {
                                    $or: searchWords.map(word => ({
                                        $or: [
                                            { $regexMatch: { input: { $ifNull: ["$$v.sku", ""] }, regex: `^${escapeRegex(word)}`, options: "i" } },
                                            { $gt: [
                                                { $size: { 
                                                    $filter: { 
                                                        input: { $objectToArray: { $ifNull: ["$$v.attributes", {}] } }, 
                                                        cond: { $regexMatch: { input: { $toString: "$$this.v" }, regex: `^${escapeRegex(word)}`, options: "i" } } 
                                                    } 
                                                } }, 0 
                                            ] }
                                        ]
                                    }))
                                }
                            }
                        }
                    },
                    in: { $ifNull: [{ $arrayElemAt: ["$$matched", 0] }, { $arrayElemAt: ["$variants", 0] }] }
                }
            }
        }
    });

    const aggregate = Product.aggregate(pipeline);
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const result = await Product.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, result, "Deep search results fetched")
    );
});

const addVariant = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { 
        attributes, 
        productPrice, 
        discountPercentage, 
        productStock 
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    // Admin owns the catalog in single-store-owner mode, so no per-seller ownership check is needed here.
    // 1. Parse Attributes
    const parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    
    // 2. AUTO-GENERATE SKU
    // Pattern: BRAND-NAME-ATTRIBUTEVALUE-RANDOM
    const brandCode = product.brand.substring(0, 3).toUpperCase();
    const nameCode = product.productName.substring(0, 3).toUpperCase();
    
    // Extract any one attribute value
    const attrValue = Object.values(parsedAttributes)[0]?.substring(0, 3).toUpperCase() || "VAR";
    const randomCode = Math.floor(1000 + Math.random() * 9000); // 4 digit random number

    const autoGeneratedSku = `${brandCode}-${nameCode}-${attrValue}-${randomCode}`;

    // 3. Handle Image
    const variantImageLocalPath = req.file?.path;
    if (!variantImageLocalPath) throw new ApiError(400, "Variant image is required");

    const uploadedImage = await uploadOnCloudinary(variantImageLocalPath);

    if(!uploadedImage.url) throw new ApiError(400, "Error uploading image")

    // 4. Push Variant
    product.variants.push({
        attributes: parsedAttributes,
        productPrice: Number(productPrice),
        discountPercentage: Number(discountPercentage || 0),
        productStock: Number(productStock),
        sku: autoGeneratedSku, // Here is our generated SKU
        variantImage: uploadedImage.url
    });

    await product.save();

    return res.status(201).json(
        new ApiResponse(201, product, `Variant added with SKU: ${autoGeneratedSku}`)
    );
});

const updateVariantDiscount = asyncHandler(async (req, res) => {
    const { productId, variantId } = req.params;
    const { discountPercentage } = req.body; // e.g., 20

    if (discountPercentage < 0 || discountPercentage > 100) {
        throw new ApiError(400, "Discount must be between 0 and 100");
    }

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const variant = product.variants.id(variantId);
    if (!variant) throw new ApiError(404, "Variant not found");

    variant.discountPercentage = Number(discountPercentage);

    await product.save();

    return res.status(200).json(
        new ApiResponse(200, product, `Discount updated to ${discountPercentage}% for variant ${variant.sku}`)
    );
});

const deleteVariant = asyncHandler(async (req, res) => {
    const { productId, variantId } = req.params;

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    if (product.variants.length <= 1) {
        throw new ApiError(400, "Cannot delete the last variant. At least one variant is required. Delete the entire product instead.");
    }

    product.variants.pull({ _id: variantId });

    await product.save();

    return res.status(200).json(
        new ApiResponse(200, product, "Variant deleted and base price updated")
    );
});

const adjustVariantStock = asyncHandler(async (req, res) => {
    const { productId, variantId } = req.params;
    const { stockDelta } = req.body;

    const delta = Number(stockDelta);
    if (!Number.isFinite(delta) || delta === 0) {
        throw new ApiError(400, "Stock adjustment must be a non-zero number");
    }

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const variant = product.variants.id(variantId);
    if (!variant) throw new ApiError(404, "Variant not found");

    const nextStock = Number(variant.productStock || 0) + delta;
    if (nextStock < 0) {
        throw new ApiError(400, "Stock cannot go below zero");
    }

    variant.productStock = nextStock;
    await product.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            product,
            delta > 0
                ? `Restocked ${delta} units successfully`
                : `Reduced stock by ${Math.abs(delta)} units successfully`
        )
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const product = await Product.findById(productId)
        .populate("category", "name");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product details fetched successfully")
    );
});

const getAllProducts = asyncHandler(async (req, res) => {

    const products = await Product.find({})
        .populate("category", "name") 
        .sort("-createdAt"); 

    if (!products || products.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No products found in the store")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, products, "Products fetched for landing page")
    );
});

const getLandingPageProducts = asyncHandler(async (req, res) => {
    const groupedProducts = await Category.aggregate([
        {
            $match: {
                // level: 0,
                isActive: true
            }
        },
        {
            $lookup: {
                from: "products", // MongoDB collection name for Product model
                localField: "_id",
                foreignField: "category",
                as: "categoryProducts"
            }
        },
        {
            $project: {
                categoryName: "$name",
                categorySlug: "$slug",
                categoryImage: "$image",
                products: {
                    $slice: [
                        {
                            $filter: {
                                input: "$categoryProducts",
                                as: "prod",
                                cond: { $eq: ["$$prod.isActive", true] }
                            }
                        },
                        8
                    ]
                }
            }
        },
        {
            $match: {
                "products.0": { $exists: true }
            }
        },
        { $sort: { categoryName: 1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, groupedProducts, "Landing page products fetched by category")
    );
});


export { 
    createProductByAdmin,
    toggleProductStatusByAdmin,
    deleteProduct, 
    updateProductDetails,
    searchProductsDeep,
    addVariant,
    updateVariantDiscount,
    deleteVariant,
    adjustVariantStock,
    getProductById,
    getAllProducts,
    getLandingPageProducts,
};
