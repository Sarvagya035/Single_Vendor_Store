import { BulkInquiry } from "../models/bulkInquiry.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendBulkInquiryStatusEmail } from "../utils/bulkInquiryNotifications.js";

const allowedStatuses = ["new", "reviewed", "contacted", "closed"];
const MAX_RESPONSE_MESSAGE_LENGTH = 1000;

const serializeBulkInquiry = (inquiryDoc) => {
    const inquiry = inquiryDoc.toObject ? inquiryDoc.toObject() : { ...inquiryDoc };

    return {
        ...inquiry,
        quantity: inquiry.quantity ?? ""
    };
};

const getResponderName = (user) => {
    if (!user) {
        return "our team";
    }

    return String(user.username || user.fullName || user.email || "our team").trim() || "our team";
};

const getAdminBulkInquiries = asyncHandler(async (req, res) => {
    const inquiries = await BulkInquiry.find().sort({ createdAt: -1 });

    const summary = {
        totalInquiries: inquiries.length,
        newCount: inquiries.filter((item) => item.status === "new").length,
        reviewedCount: inquiries.filter((item) => item.status === "reviewed").length,
        contactedCount: inquiries.filter((item) => item.status === "contacted").length,
        closedCount: inquiries.filter((item) => item.status === "closed").length
    };

    return res.status(200).json(
        new ApiResponse(200, {
            inquiries: inquiries.map(serializeBulkInquiry),
            summary
        }, "Bulk inquiries fetched successfully")
    );
});

const getAdminBulkInquiryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Bulk inquiry ID is required");
    }

    const inquiry = await BulkInquiry.findById(id);

    if (!inquiry) {
        throw new ApiError(404, "Bulk inquiry not found");
    }

    return res.status(200).json(
        new ApiResponse(200, serializeBulkInquiry(inquiry), "Bulk inquiry fetched successfully")
    );
});

const updateAdminBulkInquiryStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, message } = req.body || {};
    const normalizedStatus = String(status || "").trim();
    const normalizedMessage = typeof message === "string" ? message.trim() : "";

    if (!id) {
        throw new ApiError(400, "Bulk inquiry ID is required");
    }

    if (!normalizedStatus) {
        throw new ApiError(400, "Status is required");
    }

    if (!allowedStatuses.includes(normalizedStatus)) {
        throw new ApiError(400, "Invalid status. Use new, reviewed, contacted, or closed");
    }

    if (normalizedMessage.length > MAX_RESPONSE_MESSAGE_LENGTH) {
        throw new ApiError(400, "Message cannot exceed 1000 characters");
    }

    const inquiry = await BulkInquiry.findById(id);

    if (!inquiry) {
        throw new ApiError(404, "Bulk inquiry not found");
    }

    const hasStatusChanged = inquiry.status !== normalizedStatus;
    const hasMessage = Boolean(normalizedMessage);

    if (!hasStatusChanged && !hasMessage) {
        return res.status(200).json(
            new ApiResponse(200, {
                inquiry: serializeBulkInquiry(inquiry),
                emailSent: false,
                emailWarning: null
            }, "No changes were made")
        );
    }

    inquiry.status = normalizedStatus;

    if (hasMessage) {
        inquiry.vendorResponseMessage = normalizedMessage;
    }

    inquiry.lastRespondedBy = req.user?._id || null;
    inquiry.lastRespondedAt = new Date();

    const updatedInquiry = await inquiry.save();
    let emailSent = false;
    let emailWarning = null;

    if (updatedInquiry.email) {
        try {
            emailSent = await sendBulkInquiryStatusEmail({
                inquiry: updatedInquiry,
                status: normalizedStatus,
                message: normalizedMessage || updatedInquiry.vendorResponseMessage,
                responderName: getResponderName(req.user)
            });
        } catch (error) {
            emailWarning = "Status updated, but email could not be sent.";
            console.error("[Bulk Inquiry Email] Failed to send status update:", error?.message || error);
        }
    }

    const responseMessage = emailWarning
        ? "Status updated, but email could not be sent."
        : emailSent
            ? "Status updated and customer email sent."
            : "Status updated successfully.";

    return res.status(200).json(
        new ApiResponse(200, {
            inquiry: serializeBulkInquiry(updatedInquiry),
            emailSent,
            emailWarning
        }, responseMessage)
    );
});

export {
    getAdminBulkInquiries,
    getAdminBulkInquiryById,
    updateAdminBulkInquiryStatus
};
