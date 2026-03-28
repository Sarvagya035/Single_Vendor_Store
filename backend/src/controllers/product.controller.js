import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { Vendor } from "../models/vendor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";

const createProduct = asyncHandler(async (req, res) => {
    // 1. Extract basic details
    const { productName, productDescription, brand, category, variantOptions, variants } = req.body;

    // 2. Validation
    if ([productName, productDescription, category].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Required fields are missing");
    }

    // 3. Check if Category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) throw new ApiError(404, "Category not found");

    // 4. Check if Vendor is approved (Using req.user from verifyJWT)
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || vendor.verificationStatus !== "approved") {
        throw new ApiError(403, "Only approved vendors can create products");
    }

    // 5. Handle mainImages Upload (Array)
    const mainImageFiles = req.files?.mainImages;
    if (!mainImageFiles || mainImageFiles.length === 0) {
        throw new ApiError(400, "At least one main product image is required");
    }

    const mainImageUrls = (await Promise.all(
        mainImageFiles.map(async (file) => {
            const uploaded = await uploadOnCloudinary(file.path);
            return uploaded?.url;
        })
    )).filter(url => url != null)

    // 6. Parse and Process Variants
    // We expect variants as a JSON string from frontend/Postman

    let parsedVariants = JSON.parse(variants);
    let parsedOptions = JSON.parse(variantOptions);

    // 7. Handle Variant Images (Mapping them to the correct variant)
    // Multer gives us an array of variantImages in req.files.variantImages

    const variantImageFiles = req.files?.variantImages || [];
    
    // We upload them all to Cloudinary first

    const uploadedVariantImages = await Promise.all(
        variantImageFiles.map(async (file) => {
            const uploaded = await uploadOnCloudinary(file.path);
            return {
                url: uploaded?.url,
                originalName: file.originalname // We use this to match
            };
        })
    );

    // Map the uploaded URLs back to the specific variants
    // Convention: Frontend sends 'variantImageIndex' to specify which file belongs to which variant

    const finalVariants = parsedVariants.map((variant, index) => {

        // If the frontend provided a reference to a specific file index
        if (variant.imageRef !== undefined && uploadedVariantImages[variant.imageRef]) {
            variant.variantImage = uploadedVariantImages[variant.imageRef].url;
        }

        if (!variant.sku) {
            const randomID = Math.floor(1000 + Math.random() * 9000);
            const cleanName = productName.substring(0, 3).toUpperCase().replace(/\s/g, '');
            const firstAttr = variant.attributes ? Object.values(variant.attributes)[0] : "VAR";
            const attrValue = String(firstAttr).substring(0, 3).toUpperCase().replace(/\s/g, '');
            
            variant.sku = `${cleanName}-${attrValue}-${randomID}`;
        } else {
            variant.sku = variant.sku.trim().toUpperCase();
        }
        return variant;
    });

    // 8. Create Product
    const product = await Product.create({
        productName,
        productDescription,
        brand: brand || "Generic",
        vendor: vendor._id,
        category,
        mainImages: mainImageUrls,
        variantOptions: parsedOptions,
        variants: finalVariants
    });

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

const getVendorProducts = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findOne({ user: req.user._id });
    
    if (!vendor) {
        throw new ApiError(404, "Vendor profile not found");
    }

    const { page = 1, limit = 10 } = req.query;

    const myProducts = Product.aggregate([
        {
            $match: {
                vendor: new mongoose.Types.ObjectId(vendor._id) 
            }
        },
        {
            $sort: { createdAt: -1 } 
        },
        {
            
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        { $unwind: "$categoryDetails" }
    ]);

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

const getAllProducts = asyncHandler(async (req, res) => {

    const products = await Product.find({})
        .populate("category", "name") 
        .populate("vendor", "shopName vendorLogo") 
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
    createProduct, 
    getVendorProducts, 
    deleteProduct, 
    updateProductDetails,
    searchProductsDeep,
    restockVariant,
    addVariant,
    updateVariantDiscount,
    deleteVariant,
    getProductById,
    getAllProducts,
    getLandingPageProducts,
};
