import mongoose, { Schema } from "mongoose";

const adminNotificationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
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
        referenceType: {
            type: String,
            required: true,
            trim: true,
            default: "bulkInquiry"
        },
        referenceId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        readAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

adminNotificationSchema.index(
    { user: 1, referenceType: 1, referenceId: 1 },
    { unique: true }
);

export const AdminNotification = mongoose.model("AdminNotification", adminNotificationSchema);
