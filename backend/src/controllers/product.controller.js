import mongoose from "mongoose";
import fs from "fs";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { Vendor } from "../models/vendor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteCloudinaryImage } from "../utils/cloudinaryUpload.js";
import { syncLowStockNotificationsForProduct } from "../utils/vendorNotifications.js";

const cleanupTempFiles = async (files) => {
    const fileGroups = files || {};
    const allFiles = [
        ...(fileGroups.mainImages || []),
        ...(fileGroups.variantImages || []),
        ...(fileGroups.image || []),
    ];

    for (const file of allFiles) {
        if (file?.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            } catch (error) {
                console.error("Failed to clean temp file:", file.path, error?.message || error);
            }
        }
    }
};

const parseJsonField = (value, fieldName) => {
    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        throw new ApiError(400, `Invalid ${fieldName} format`);
    }
};

const deleteUploadedCloudinaryAssets = async (uploadedAssets = []) => {
    await Promise.allSettled(
        uploadedAssets
            .filter((asset) => asset?.public_id)
            .map((asset) => deleteCloudinaryImage(asset.public_id))
    );
};

const createProduct = asyncHandler(async (req, res) => {
    const { productName, productDescription, brand, category, variantOptions, variants } = req.body;
    const uploadedCloudinaryAssets = [];
    let product = null;

    try {
        if ([productName, productDescription, category, variantOptions, variants].some((field) => !field || String(field).trim() === "")) {
            throw new ApiError(400, "Required fields are missing");
        }

        if (!mongoose.Types.ObjectId.isValid(category)) {
            throw new ApiError(400, "Invalid category");
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) throw new ApiError(404, "Category not found");

        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor) {
            throw new ApiError(404, "Vendor not found");
        }

        const parsedVariants = parseJsonField(variants, "variants");
        const parsedOptions = parseJsonField(variantOptions, "variant options");

        if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
            throw new ApiError(400, "At least one variant is required");
        }

        if (!parsedOptions || typeof parsedOptions !== "object") {
            throw new ApiError(400, "Variant options are required");
        }

        const mainImageFiles = req.files?.mainImages || [];
        if (!mainImageFiles.length) {
            throw new ApiError(400, "At least one main product image is required");
        }

        const mainImageUrls = [];
        for (const file of mainImageFiles) {
            const uploaded = await uploadOnCloudinary(file.path);
            if (!uploaded?.url) {
                throw new ApiError(400, "Error uploading main product image");
            }

            uploadedCloudinaryAssets.push(uploaded);
            mainImageUrls.push(uploaded.url);
        }

        const variantImageFiles = req.files?.variantImages || [];
        const uploadedVariantImages = [];

        for (const file of variantImageFiles) {
            const uploaded = await uploadOnCloudinary(file.path);
            if (!uploaded?.url) {
                throw new ApiError(400, "Error uploading variant image");
            }

            uploadedCloudinaryAssets.push(uploaded);
            uploadedVariantImages.push({
                url: uploaded.url,
                public_id: uploaded.public_id,
                originalName: file.originalname
            });
        }

        const finalVariants = parsedVariants.map((variant) => {
            const normalizedVariant = { ...variant };

            if (normalizedVariant.imageRef !== undefined && uploadedVariantImages[normalizedVariant.imageRef]) {
                normalizedVariant.variantImage = uploadedVariantImages[normalizedVariant.imageRef].url;
            }

            if (!normalizedVariant.sku) {
                const randomID = Math.floor(1000 + Math.random() * 9000);
                const cleanName = String(productName).substring(0, 3).toUpperCase().replace(/\s/g, '');
                const firstAttr = normalizedVariant.attributes ? Object.values(normalizedVariant.attributes)[0] : "VAR";
                const attrValue = String(firstAttr).substring(0, 3).toUpperCase().replace(/\s/g, '');

                normalizedVariant.sku = `${cleanName}-${attrValue}-${randomID}`;
            } else {
                normalizedVariant.sku = String(normalizedVariant.sku).trim().toUpperCase();
            }

            return normalizedVariant;
        });

        product = await Product.create({
            productName: String(productName).trim(),
            productDescription: String(productDescription).trim(),
            brand: brand ? String(brand).trim() : "Generic",
            vendor: vendor._id,
            category,
            mainImages: mainImageUrls,
            variantOptions: parsedOptions,
            variants: finalVariants
        });
    } catch (error) {
        await deleteUploadedCloudinaryAssets(uploadedCloudinaryAssets);
        throw error;
    } finally {
        await cleanupTempFiles(req.files);
    }

    await syncLowStockNotificationsForProduct(product);

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

const getVendorProducts = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findOne({ user: req.user._id });
    
    if (!vendor) {
        throw new ApiError(404, "Vendor profile not found");
    }

    const { page = 1, limit = 10, q = "", category = "", status = "all" } = req.query;

    const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const trimmedQuery = String(q || "").trim();

    const pipeline = [
        {
            $match: {
                vendor: new mongoose.Types.ObjectId(vendor._id) 
            }
        }
    ];

    if (status === "active") {
        pipeline.push({
            $match: {
                isActive: true
            }
        });
    } else if (status === "inactive") {
        pipeline.push({
            $match: {
                isActive: false
            }
        });
    }

    if (category) {
        pipeline.push({
            $match: {
                category: new mongoose.Types.ObjectId(category)
            }
        });
    }

    pipeline.push(
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
        }
    );

    if (trimmedQuery) {
        const queryRegex = { $regex: escapeRegex(trimmedQuery), $options: "i" };

        pipeline.push({
            $match: {
                $or: [
                    { productName: queryRegex },
                    { brand: queryRegex },
                    { "categoryDetails.name": queryRegex },
                    { "categoryDetails.slug": queryRegex },
                    { "variants.sku": queryRegex },
                    { "variants.attributes.$**": queryRegex }
                ]
            }
        });
    }

    pipeline.push({
        $sort: { createdAt: -1 } 
    });

    const myProducts = Product.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    // 4. Paginate results
    const products = await Product.aggregatePaginate(myProducts, options);

    return res.status(200).json(
        new ApiResponse(200, products, "Vendor products fetched successfully")
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (product.vendor.toString() !== vendor._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this product");
    }
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

    const roles = Array.isArray(req.user?.role) ? req.user.role : [req.user?.role];
    const isAdmin = roles.some((role) => String(role).toLowerCase() === "admin");

    if (!isAdmin) {
        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor || product.vendor.toString() !== vendor._id.toString()) {
            throw new ApiError(403, "Unauthorized: You don't own this product");
        }
    }

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

const restockVariant = asyncHandler(async (req, res) => {
    const { productId, variantId } = req.params;
    const { stockToAdd } = req.body; // e.g., 50

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    // Find the specific variant in the array
    const variant = product.variants.id(variantId); 
    if (!variant) throw new ApiError(404, "Variant not found");

    // Update stock
    variant.productStock += Number(stockToAdd);

    // Save to trigger middleware (updates isAvailable flag)
    await product.save();
    await syncLowStockNotificationsForProduct(product);

    return res.status(200).json(
        new ApiResponse(200, product, `Restocked ${stockToAdd} units successfully`)
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

    // if (product.vendor.toString() !== req.user._id.toString()) {
    //    throw new ApiError(403, "You are not authorized to add variants to this product");
    // }
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
    await syncLowStockNotificationsForProduct(product);

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
    await syncLowStockNotificationsForProduct(product);

    return res.status(200).json(
        new ApiResponse(200, product, `Discount updated to ${discountPercentage}% for variant ${variant.sku}`)
    );
});

const updateVariant = asyncHandler(async (req, res) => {
    const { productId, variantId } = req.params;
    const {
        attributes,
        productPrice,
        discountPercentage,
        productStock,
        sku
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || product.vendor.toString() !== vendor._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this variant");
    }

    const variant = product.variants.id(variantId);
    if (!variant) throw new ApiError(404, "Variant not found");

    if (typeof attributes !== "undefined") {
        const parsedAttributes = typeof attributes === "string" ? JSON.parse(attributes) : attributes;

        if (!parsedAttributes || typeof parsedAttributes !== "object" || !Object.keys(parsedAttributes).length) {
            throw new ApiError(400, "Variant attributes are required");
        }

        variant.attributes = parsedAttributes;
    }

    if (typeof productPrice !== "undefined" && productPrice !== "") {
        const normalizedPrice = Number(productPrice);
        if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
            throw new ApiError(400, "Variant price must be a valid non-negative number");
        }
        variant.productPrice = normalizedPrice;
    }

    if (typeof discountPercentage !== "undefined" && discountPercentage !== "") {
        const normalizedDiscount = Number(discountPercentage);
        if (!Number.isFinite(normalizedDiscount) || normalizedDiscount < 0 || normalizedDiscount > 100) {
            throw new ApiError(400, "Discount must be between 0 and 100");
        }
        variant.discountPercentage = normalizedDiscount;
    }

    if (typeof productStock !== "undefined" && productStock !== "") {
        const normalizedStock = Number(productStock);
        if (!Number.isFinite(normalizedStock) || normalizedStock < 0) {
            throw new ApiError(400, "Stock must be a valid non-negative number");
        }
        variant.productStock = normalizedStock;
    }

    if (typeof sku !== "undefined") {
        const normalizedSku = String(sku || "").trim().toUpperCase();
        if (!normalizedSku) {
            throw new ApiError(400, "SKU is required");
        }
        variant.sku = normalizedSku;
    }

    const variantImageLocalPath = req.file?.path;
    if (variantImageLocalPath) {
        const uploadedImage = await uploadOnCloudinary(variantImageLocalPath);
        if (!uploadedImage?.url) throw new ApiError(400, "Error uploading image");
        variant.variantImage = uploadedImage.url;
    }

    await product.save();
    await syncLowStockNotificationsForProduct(product);

    return res.status(200).json(
        new ApiResponse(200, product, `Variant ${variant.sku} updated successfully`)
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
    await syncLowStockNotificationsForProduct(product);

    return res.status(200).json(
        new ApiResponse(200, product, "Variant deleted and base price updated")
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const product = await Product.findById(productId)
        .populate("category", "name")
        .populate("vendor", "shopName vendorLogo vendorDescription");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product details fetched successfully")
    );
});

const getProductsByIds = asyncHandler(async (req, res) => {
    try {
        const rawBody = req.body || {};
        const rawProductIds = Array.isArray(rawBody.productIds)
            ? rawBody.productIds
            : Array.isArray(rawBody.items)
                ? rawBody.items.map((item) => item?.productId || item?._id || item?.id)
                : [];

        const validIds = [...new Set(
            rawProductIds
                .map((id) => String(id || "").trim())
                .filter((id) => mongoose.Types.ObjectId.isValid(id))
        )];

        if (validIds.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "Products fetched successfully")
            );
        }

        const products = await Product.find({
            _id: { $in: validIds },
            isActive: true
        })
            .populate("category", "name slug")
            .populate("vendor", "shopName vendorLogo vendorDescription")
            .lean();

        const productMap = new Map(products.map((product) => [product._id.toString(), product]));
        const orderedProducts = validIds
            .map((id) => productMap.get(id))
            .filter(Boolean);

        return res.status(200).json(
            new ApiResponse(200, orderedProducts, "Products fetched successfully")
        );
    } catch (error) {
        console.error("Failed to bulk fetch products:", error?.message || error);
        return res.status(200).json(
            new ApiResponse(200, [], "Products fetched successfully")
        );
    }
});

const getAllProducts = asyncHandler(async (req, res) => {
    const {
        q = "",
        category = "",
        brand = "",
        minPrice = "",
        maxPrice = "",
        availability = "all",
        rating = "all",
        sortBy = "relevance",
        page = 1,
        limit = 12
    } = req.query;

    const trimmedQuery = String(q || "").trim();
    const trimmedCategory = String(category || "").trim();
    const trimmedBrand = String(brand || "").trim();
    const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const pipeline = [
        {
            $match: {
                isActive: true
            }
        },
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
            $addFields: {
                hasInStockVariant: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: "$variants",
                                    as: "variant",
                                    cond: { $gt: ["$$variant.productStock", 0] }
                                }
                            }
                        },
                        0
                    ]
                }
            }
        }
    ];

    if (trimmedQuery) {
        const queryRegex = { $regex: escapeRegex(trimmedQuery), $options: "i" };
        pipeline.push({
            $match: {
                $or: [
                    { productName: queryRegex },
                    { brand: queryRegex },
                    { "categoryDetails.name": queryRegex },
                    { "categoryDetails.slug": queryRegex },
                    { "variants.sku": queryRegex },
                    { "variants.attributes.$**": queryRegex }
                ]
            }
        });
    }

    if (trimmedCategory) {
        const categoryMatch = { $regex: escapeRegex(trimmedCategory), $options: "i" };
        const categoryFilters = [
            { "categoryDetails.name": categoryMatch },
            { "categoryDetails.slug": categoryMatch }
        ];

        if (mongoose.Types.ObjectId.isValid(trimmedCategory)) {
            categoryFilters.push({ category: new mongoose.Types.ObjectId(trimmedCategory) });
        }

        pipeline.push({
            $match: {
                $or: categoryFilters
            }
        });
    }

    if (trimmedBrand) {
        pipeline.push({
            $match: {
                brand: { $regex: escapeRegex(trimmedBrand), $options: "i" }
            }
        });
    }

    if (minPrice !== "" || maxPrice !== "") {
        const priceQuery = {};
        if (minPrice !== "") priceQuery.$gte = Number(minPrice);
        if (maxPrice !== "") priceQuery.$lte = Number(maxPrice);

        pipeline.push({
            $match: {
                basePrice: priceQuery
            }
        });
    }

    if (rating !== "all") {
        const normalizedRating = Number(rating);
        if (Number.isFinite(normalizedRating)) {
            pipeline.push({
                $match: {
                    averageRating: { $gte: normalizedRating }
                }
            });
        }
    }

    if (availability === "in-stock") {
        pipeline.push({
            $match: {
                hasInStockVariant: true
            }
        });
    } else if (availability === "out-of-stock") {
        pipeline.push({
            $match: {
                hasInStockVariant: false
            }
        });
    }

    switch (sortBy) {
        case "price-asc":
            pipeline.push({ $sort: { basePrice: 1, createdAt: -1 } });
            break;
        case "price-desc":
            pipeline.push({ $sort: { basePrice: -1, createdAt: -1 } });
            break;
        case "rating-desc":
            pipeline.push({ $sort: { averageRating: -1, numberOfReviews: -1, createdAt: -1 } });
            break;
        case "popular":
            pipeline.push({ $sort: { numberOfReviews: -1, averageRating: -1, createdAt: -1 } });
            break;
        case "newest":
            pipeline.push({ $sort: { createdAt: -1 } });
            break;
        default:
            pipeline.push({ $sort: { createdAt: -1 } });
            break;
    }

    const aggregate = Product.aggregate(pipeline);
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const result = await Product.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, result, "Products fetched successfully")
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
    createProduct, 
    getVendorProducts, 
    deleteProduct, 
    updateProductDetails,
    searchProductsDeep,
    restockVariant,
    addVariant,
    updateVariant,
    updateVariantDiscount,
    deleteVariant,
    getProductById,
    getProductsByIds,
    getAllProducts,
    getLandingPageProducts,
};
