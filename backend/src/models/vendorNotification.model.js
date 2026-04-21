import mongoose, { Schema } from "mongoose";

const vendorNotificationSchema = new Schema(
    {
        vendor: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ["low_stock"],
            default: "low_stock",
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
            index: true
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        variantId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        productName: {
            type: String,
            required: true,
            trim: true
        },
        variantLabel: {
            type: String,
            required: true,
            trim: true
        },
        currentStock: {
            type: Number,
            required: true,
            min: 0
        },
        stockThreshold: {
            type: Number,
            default: 5,
            min: 0
        },
        actionLink: {
            type: String,
            default: ""
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        readAt: {
            type: Date
        },
        isResolved: {
            type: Boolean,
            default: false,
            index: true
        },
        resolvedAt: {
            type: Date
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

vendorNotificationSchema.index(
    { vendor: 1, productId: 1, variantId: 1, type: 1 },
    { unique: true }
);

export const VendorNotification = mongoose.model("VendorNotification", vendorNotificationSchema);
