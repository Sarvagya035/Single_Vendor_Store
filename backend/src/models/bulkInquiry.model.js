import mongoose, { Schema } from "mongoose";

const bulkInquirySchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            trim: true
        },
        businessName: {
            type: String,
            trim: true
        },
        orderType: {
            type: String,
            required: true,
            trim: true
        },
        productRequirement: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Schema.Types.Mixed
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["new", "reviewed", "contacted", "closed"],
            default: "new",
            trim: true
        },
        vendorResponseMessage: {
            type: String,
            trim: true
        },
        lastRespondedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        lastRespondedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const BulkInquiry = mongoose.model("BulkInquiry", bulkInquirySchema);
