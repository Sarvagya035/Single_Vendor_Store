import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {Vendor} from "../models/vendor.model.js"
import {Product} from "../models/product.model.js"
import { Order } from "../models/order.model.js";
import { createProductRecord } from "../services/productCreation.service.js";
import { buildCsvReport, buildPdfStream, formatDateForReport, formatDateOnly, formatDisplayOrderId } from "../utils/reportExport.js";

const normalizeBoolean = (value, fallback = true) => {
    if (typeof value === "undefined") {
        return fallback;
    }

    if (typeof value === "string") {
        return !["false", "0", "no"].includes(value.trim().toLowerCase());
    }

    return Boolean(value);
};

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Important: Check Whether admin should not delete himself.
    if (user._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot delete your own admin account");
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json(
        new ApiResponse(200, null, "User deleted successfully")
    );
});

const deleteVendorAndProducts = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    // 1. Delete all products associated with this vendor
    await Product.deleteMany({ vendor: vendorId });

    // 2. Delete the Vendor Profile
    await Vendor.findByIdAndDelete(vendorId);

    // 3. Optional: Update User Role (Vendor role hata dena)
    await User.findByIdAndUpdate(vendor.user, {
        $pull: { role: "vendor" } 
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Vendor and all their products have been removed")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const skip = (page - 1) * limit;

    
    const users = await User.find()
        .select("-password -refreshToken")
        .sort("-createdAt") // New users pehle dikhein
        .skip(skip)
        .limit(limit);

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }, "Users fetched with pagination")
    );
});

const createProductForVendor = asyncHandler(async (req, res) => {
    const {
        vendorId,
        isActive,
        ...productData
    } = req.body;

    if (!vendorId) {
        throw new ApiError(400, "vendorId is required");
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");
    if (vendor.verificationStatus !== "approved") {
        throw new ApiError(403, "Products can only be assigned to approved vendors");
    }

    const product = await createProductRecord({
        ...productData,
        vendorId: vendor._id,
        mainImages: req.files?.mainImages || [],
        variantImages: req.files?.variantImages || [],
        isActive: normalizeBoolean(isActive, true)
    });

    return res.status(201).json(
        new ApiResponse(201, product, "Product created for vendor successfully")
    );
});

const deleteProductByAdmin = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    await Product.findByIdAndDelete(productId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Product deleted by admin successfully")
    );
});

const toggleProductStatusByAdmin = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive === "undefined") {
        throw new ApiError(400, "isActive is required");
    }

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    product.isActive = normalizeBoolean(isActive, product.isActive);

    const updatedProduct = await product.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product status updated successfully")
    );
});

const toStartOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

const toEndOfDay = (date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

const resolveReportWindow = (range, startDate, endDate) => {
    const normalizedRange = String(range || "weekly").toLowerCase();
    const now = new Date();

    if (normalizedRange === "weekly") {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        return {
            rangeLabel: "weekly",
            startDate: toStartOfDay(start),
            endDate: toEndOfDay(now)
        };
    }

    if (normalizedRange === "monthly") {
        const start = new Date(now);
        start.setDate(start.getDate() - 29);
        return {
            rangeLabel: "monthly",
            startDate: toStartOfDay(start),
            endDate: toEndOfDay(now)
        };
    }

    if (normalizedRange === "custom") {
        if (!startDate || !endDate) {
            throw new ApiError(400, "Start date and end date are required for custom reports");
        }

        const parsedStart = new Date(startDate);
        const parsedEnd = new Date(endDate);

        if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
            throw new ApiError(400, "Invalid custom report dates");
        }

        if (parsedStart > parsedEnd) {
            throw new ApiError(400, "Start date must be before end date");
        }

        return {
            rangeLabel: `custom-${formatDateOnly(parsedStart)}-to-${formatDateOnly(parsedEnd)}`,
            startDate: toStartOfDay(parsedStart),
            endDate: toEndOfDay(parsedEnd)
        };
    }

    throw new ApiError(400, "Invalid report range. Use weekly, monthly, or custom");
};

const downloadOrderReports = asyncHandler(async (req, res) => {
    const { range, format, startDate, endDate, dateFrom, dateTo, status } = req.query;
    const normalizedFormat = String(format || "csv").toLowerCase();

    if (!["csv", "pdf"].includes(normalizedFormat)) {
        throw new ApiError(400, "Invalid report format. Use csv or pdf");
    }

    const reportWindow = resolveReportWindow(range, startDate, endDate);
    const effectiveFrom = dateFrom || formatDateOnly(reportWindow.startDate);
    const effectiveTo = dateTo || formatDateOnly(reportWindow.endDate);

    const orderQuery = {
        "paymentInfo.status": "Paid"
    };

    if (status) {
        orderQuery.orderStatus = status;
    }

    if (effectiveFrom || effectiveTo) {
        orderQuery.paidAt = {};

        if (effectiveFrom) {
            const parsedFrom = new Date(effectiveFrom);
            if (Number.isNaN(parsedFrom.getTime())) {
                throw new ApiError(400, "Invalid dateFrom");
            }
            parsedFrom.setHours(0, 0, 0, 0);
            orderQuery.paidAt.$gte = parsedFrom;
        }

        if (effectiveTo) {
            const parsedTo = new Date(effectiveTo);
            if (Number.isNaN(parsedTo.getTime())) {
                throw new ApiError(400, "Invalid dateTo");
            }
            parsedTo.setHours(23, 59, 59, 999);
            orderQuery.paidAt.$lte = parsedTo;
        }
    } else {
        orderQuery.$or = [
            {
                paidAt: {
                    $gte: reportWindow.startDate,
                    $lte: reportWindow.endDate
                }
            },
            {
                paidAt: null,
                createdAt: {
                    $gte: reportWindow.startDate,
                    $lte: reportWindow.endDate
                }
            }
        ];
    }

    const paidOrders = await Order.find(orderQuery)
        .select("user orderItems orderStatus paidAt createdAt totalAmount paymentInfo")
        .populate("user", "fullName email phone")
        .sort({ paidAt: -1, createdAt: -1 })
        .lean();

    const filteredOrders = paidOrders;

    const summary = {
        totalOrders: filteredOrders.length,
        totalItems: 0,
        totalRevenue: 0,
        statusCounts: {
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        }
    };

    const headers = [
        "Order ID",
        "Order Date",
        "Customer",
        "Customer Email",
        "Order Status",
        "Item Name",
        "Quantity",
        "Unit Price",
        "Line Total"
    ];

    const rows = [];

    filteredOrders.forEach((order) => {
        const orderStatus = order.orderStatus || "Processing";
        summary.statusCounts[orderStatus] = (summary.statusCounts[orderStatus] || 0) + 1;

        const customerName = order.user?.fullName || order.user?.username || order.user?.email || "Unknown";
        const customerEmail = order.user?.email || "-";
        const orderDate = formatDateForReport(order.paidAt || order.createdAt);

        order.orderItems.forEach((item) => {
            const quantity = Number(item.quantity || 0);
            const unitPrice = Number(item.price || 0);
            const lineTotal = unitPrice * quantity;

            summary.totalItems += quantity;
            summary.totalRevenue += lineTotal;

            rows.push([
                formatDisplayOrderId(order._id),
                orderDate,
                customerName,
                customerEmail,
                orderStatus,
                item.name || "Item",
                quantity,
                unitPrice,
                lineTotal
            ]);
        });
    });

    const summaryRows = [
        ["Report Range", reportWindow.rangeLabel],
        ["Start Date", formatDateOnly(reportWindow.startDate)],
        ["End Date", formatDateOnly(reportWindow.endDate)],
        ["Paid Orders", summary.totalOrders],
        ["Items Sold", summary.totalItems],
        ["Revenue", `INR ${summary.totalRevenue.toFixed(2)}`],
        ["Processing Orders", summary.statusCounts.Processing],
        ["Shipped Orders", summary.statusCounts.Shipped],
        ["Delivered Orders", summary.statusCounts.Delivered],
        ["Cancelled Orders", summary.statusCounts.Cancelled]
    ];

    const fileStamp = `${reportWindow.rangeLabel}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`;

    if (normalizedFormat === "pdf") {
        const pdfBuffer = buildPdfStream({
            title: "Order Report",
            subtitle: `Range: ${reportWindow.rangeLabel}`,
            summaryRows,
            headers,
            rows
        });

        return res
            .status(200)
            .set({
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="order-report-${fileStamp}.pdf"`
            })
            .send(pdfBuffer);
    }

    const csv = buildCsvReport({
        title: "Order Report",
        summaryRows,
        headers,
        rows
    });

    return res
        .status(200)
        .set({
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="order-report-${fileStamp}.csv"`
        })
        .send(csv);
});

export {
    deleteUser,
    deleteVendorAndProducts,
    getAllUsers,
    createProductForVendor,
    deleteProductByAdmin,
    toggleProductStatusByAdmin,
    downloadOrderReports
}
