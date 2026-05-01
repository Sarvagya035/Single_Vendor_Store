import { BulkInquiry } from "../models/bulkInquiry.model.js";
import { AdminNotification } from "../models/adminNotification.model.js";
import { createOrUpdateBulkInquiryNotifications } from "../utils/vendorNotifications.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const notifyAdminsAboutBulkInquiry = async (inquiry) => {
    const adminUsers = await User.find({
        role: { $in: ["admin"] }
    }).select("_id");

    if (!adminUsers.length) {
        return;
    }

    const displayName = String(inquiry.businessName || inquiry.fullName || "Unknown").trim();
    const orderType = String(inquiry.orderType || "bulk order").trim();
    const message = `${displayName} submitted a ${orderType} bulk inquiry.`;

    await Promise.allSettled(
        adminUsers.map((adminUser) =>
            AdminNotification.findOneAndUpdate(
                {
                    user: adminUser._id,
                    referenceType: "bulkInquiry",
                    referenceId: inquiry._id
                },
                {
                    $set: {
                        title: "New Bulk Order Inquiry",
                        message,
                        referenceType: "bulkInquiry",
                        referenceId: inquiry._id,
                        isRead: false,
                        readAt: null
                    }
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            )
        )
    );

    await createOrUpdateBulkInquiryNotifications(inquiry);
};

const createBulkInquiry = asyncHandler(async (req, res) => {
    const {
        fullName,
        phone,
        email,
        businessName,
        orderType,
        productRequirement,
        quantity,
        city
    } = req.body || {};

    const validationErrors = [];

    if (!String(fullName || "").trim()) validationErrors.push({ field: "fullName", message: "Full name is required." });
    if (!String(phone || "").trim()) validationErrors.push({ field: "phone", message: "Phone is required." });
    if (!String(orderType || "").trim()) validationErrors.push({ field: "orderType", message: "Order type is required." });
    if (!String(productRequirement || "").trim()) validationErrors.push({ field: "productRequirement", message: "Product requirement is required." });
    if (!String(city || "").trim()) validationErrors.push({ field: "city", message: "City is required." });

    if (validationErrors.length > 0) {
        throw new ApiError(400, "Please check the highlighted fields and try again.", validationErrors);
    }

    const inquiry = await BulkInquiry.create({
        fullName: String(fullName).trim(),
        phone: String(phone).trim(),
        email: String(email || "").trim() || undefined,
        businessName: String(businessName || "").trim() || undefined,
        orderType: String(orderType).trim(),
        productRequirement: String(productRequirement).trim(),
        quantity:
            quantity !== undefined && quantity !== null && String(quantity).trim() !== ""
                ? quantity
                : undefined,
        city: String(city).trim()
    });

    await notifyAdminsAboutBulkInquiry(inquiry);

    return res.status(201).json(
        new ApiResponse(201, inquiry, "Bulk inquiry submitted successfully")
    );
});

export { createBulkInquiry };
