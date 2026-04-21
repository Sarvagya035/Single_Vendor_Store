import { Product } from "../models/product.model.js";
import { Vendor } from "../models/vendor.model.js";
import { VendorNotification } from "../models/vendorNotification.model.js";

const LOW_STOCK_THRESHOLD = Number(process.env.VENDOR_LOW_STOCK_THRESHOLD || 5);

const normalizeStock = (value) => {
    const number = Number(value || 0);
    return Number.isFinite(number) && number >= 0 ? number : 0;
};

const normalizeAttributes = (attributes) => {
    if (!attributes) {
        return [];
    }

    if (typeof attributes.toObject === "function") {
        return Object.entries(attributes.toObject());
    }

    if (attributes instanceof Map) {
        return Array.from(attributes.entries());
    }

    if (typeof attributes === "object") {
        return Object.entries(attributes);
    }

    return [];
};

const buildVariantLabel = (product, variant) => {
    const attributeEntries = normalizeAttributes(variant?.attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .filter(Boolean);

    if (attributeEntries.length) {
        return attributeEntries.join(" · ");
    }

    if (variant?.sku) {
        return variant.sku;
    }

    return product?.productName || "Variant";
};

const buildLowStockPayload = (product, variant) => {
    const currentStock = normalizeStock(variant?.productStock);
    const variantLabel = buildVariantLabel(product, variant);
    const isOutOfStock = currentStock === 0;

    return {
        title: isOutOfStock
            ? `Out of stock: ${product.productName}`
            : `Low stock: ${product.productName}`,
        message: `${product.productName} (${variantLabel}) has ${currentStock} unit(s) left. Restock soon to avoid a stockout.`,
        priority: isOutOfStock || currentStock <= 2 ? "high" : "medium",
        currentStock,
        variantLabel
    };
};

const createOrUpdateLowStockNotification = async (product, variant) => {
    if (!product?._id || !variant?._id || !product.vendor) {
        return null;
    }

    const currentStock = normalizeStock(variant.productStock);
    const query = {
        vendor: product.vendor,
        type: "low_stock",
        productId: product._id,
        variantId: variant._id
    };

    if (currentStock > LOW_STOCK_THRESHOLD) {
        const resolved = await VendorNotification.findOneAndUpdate(
            query,
            {
                $set: {
                    title: `Stock recovered: ${product.productName}`,
                    message: `${product.productName} (${buildVariantLabel(product, variant)}) is back above the low-stock threshold with ${currentStock} unit(s) available.`,
                    priority: "low",
                    currentStock,
                    stockThreshold: LOW_STOCK_THRESHOLD,
                    isResolved: true,
                    isRead: false,
                    resolvedAt: new Date(),
                    metadata: {
                        currentStock,
                        stockThreshold: LOW_STOCK_THRESHOLD
                    }
                }
            },
            { new: true }
        );

        return resolved;
    }

    const payload = buildLowStockPayload(product, variant);

    const notification = await VendorNotification.findOneAndUpdate(
        query,
        {
            $set: {
                title: payload.title,
                message: payload.message,
                priority: payload.priority,
                currentStock: payload.currentStock,
                stockThreshold: LOW_STOCK_THRESHOLD,
                actionLink: `/vendor/products/${product._id}/restock`,
                productName: product.productName,
                variantLabel: payload.variantLabel,
                isRead: false,
                readAt: null,
                isResolved: false,
                resolvedAt: null,
                metadata: {
                    currentStock: payload.currentStock,
                    stockThreshold: LOW_STOCK_THRESHOLD,
                    productName: product.productName,
                    variantLabel: payload.variantLabel
                }
            }
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );

    return notification;
};

const syncLowStockNotificationsForProduct = async (productInput) => {
    const product = typeof productInput === "string"
        ? await Product.findById(productInput)
        : productInput;

    if (!product?._id || !product.vendor) {
        return [];
    }

    const lowStockVariantIds = new Set();
    const notifications = [];

    for (const variant of product.variants || []) {
        if (normalizeStock(variant?.productStock) <= LOW_STOCK_THRESHOLD) {
            lowStockVariantIds.add(variant._id.toString());
            const notification = await createOrUpdateLowStockNotification(product, variant);
            if (notification) {
                notifications.push(notification);
            }
        }
    }

    const activeNotifications = await VendorNotification.find({
        vendor: product.vendor,
        type: "low_stock",
        productId: product._id,
        isResolved: false
    });

    for (const notification of activeNotifications) {
        if (!lowStockVariantIds.has(notification.variantId.toString())) {
            notification.isResolved = true;
            notification.resolvedAt = new Date();
            notification.productName = product.productName;
            notification.variantLabel = buildVariantLabel(product, product.variants.id(notification.variantId));
            await notification.save();
        }
    }

    return notifications;
};

const syncLowStockNotificationsForVendor = async (vendorInput) => {
    const vendor = typeof vendorInput === "string"
        ? await Vendor.findById(vendorInput)
        : vendorInput;

    if (!vendor?._id) {
        return [];
    }

    const products = await Product.find({ vendor: vendor._id });
    const notifications = [];

    for (const product of products) {
        const productNotifications = await syncLowStockNotificationsForProduct(product);
        notifications.push(...productNotifications);
    }

    return notifications;
};

export {
    LOW_STOCK_THRESHOLD,
    buildVariantLabel,
    createOrUpdateLowStockNotification,
    syncLowStockNotificationsForProduct,
    syncLowStockNotificationsForVendor
};
