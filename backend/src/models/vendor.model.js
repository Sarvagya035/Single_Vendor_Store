import mongoose, { Schema } from "mongoose";

const vendorSchema = new Schema(
    {
        shopName: {
            type: String,
            required: [true, "Vendor name is required"],
            trim: true,
        },
        vendorAddress: {
            type: String,
            required: [true, "Vendor address is required"]
        },
        vendorDescription: {
            type: String,
            required: true
        },
        vendorLogo: {
            type: String,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
            unique: true,
        },
        gstNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        adminRemarks: {
            type: String,
            default: ""
        },
        bankDetails: {
            accountHolderName: {
                type: String,
                required: [true, "Account holder name is required"],
                trim: true
            },
            accountNumber: {
                type: String,
                required: [true, "Account number is required"],
                unique: true
            },
            ifscCode: {
                type: String,
                required: [true, "IFSC code is required"],
                uppercase: true
            },
            bankName: {
                type: String,
                required: [true, "Bank name is required"]
            },
            upiId: {
                type: String,
                trim: true
            }
        },
    },
    {
        timestamps: true
    }
);

export const Vendor = mongoose.model("Vendor", vendorSchema);
