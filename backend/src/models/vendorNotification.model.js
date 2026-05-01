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
            enum: ["low_stock", "bulk_inquiry"],
            default: "low_stock",
            index: true
        },
        referenceType: {
            type: String,
            trim: true,
            default: ""
        },
        referenceId: {
            type: Schema.Types.ObjectId,
            default: null,
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
            default: null,
            index: true
        },
        variantId: {
            type: Schema.Types.ObjectId,
            default: null,
            index: true
        },
        productName: {
            type: String,
            trim: true
        },
        variantLabel: {
            type: String,
            trim: true
        },
        currentStock: {
            type: Number,
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
    {
        unique: true,
        partialFilterExpression: { type: "low_stock" }
    }
);

vendorNotificationSchema.index(
    { vendor: 1, referenceType: 1, referenceId: 1, type: 1 },
    {
        unique: true,
        partialFilterExpression: { type: "bulk_inquiry" }
    }
);

export const VendorNotification = mongoose.model("VendorNotification", vendorNotificationSchema);
