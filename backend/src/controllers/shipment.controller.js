import { Order } from "../models/order.model.js";
import { Shipment } from "../models/shipment.model.js";
import { Vendor } from "../models/vendor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { syncShipmentFromDhl, syncTestShipment } from "../services/dhl.service.js";
import { sendShipmentCreatedEmail, sendShipmentStatusEmail } from "../utils/shipmentNotifications.js";
import { syncOrderFromShipment } from "../utils/shipmentOrderSync.js";

const attachShipmentToOrder = (orderDoc, shipmentDoc) => {
    const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
    order.shipment = shipmentDoc ? (shipmentDoc.toObject ? shipmentDoc.toObject() : { ...shipmentDoc }) : null;
    return order;
};

const canAccessOrder = async (order, req) => {
    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];

    if (userRoles.includes("admin")) {
        return true;
    }

    if (order.user?.toString() === req.user._id.toString()) {
        return true;
    }

    if (userRoles.includes("vendor")) {
        const vendor = await Vendor.findOne({ user: req.user._id });

        if (vendor) {
            return order.orderItems.some((item) => item.vendor?.toString() === vendor._id.toString());
        }
    }

    return false;
};

const normalizeShipmentInput = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
};

const serializeShipment = (shipmentDoc) => {
    if (!shipmentDoc) {
        return null;
    }

    const shipment = shipmentDoc.toObject ? shipmentDoc.toObject() : { ...shipmentDoc };
    const order = shipment.order?.toObject ? shipment.order.toObject() : shipment.order;

    if (order) {
        shipment.order = order;
    }

    return shipment;
};

const getShipmentDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("user", "fullName username email");
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const allowed = await canAccessOrder(order, req);
    if (!allowed) {
        throw new ApiError(403, "Unauthorized access to shipment details");
    }

    const shipment = await Shipment.findOne({ order: order._id });
    if (!shipment) {
        throw new ApiError(404, "Shipment record not found");
    }

    return res.status(200).json(
        new ApiResponse(200, shipment, "Shipment details fetched successfully")
    );
});

const syncShipmentStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("user", "fullName username email");
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const allowed = await canAccessOrder(order, req);
    if (!allowed) {
        throw new ApiError(403, "Unauthorized access to shipment sync");
    }

    const shipment = await Shipment.findOne({ order: order._id });
    if (!shipment) {
        throw new ApiError(404, "Shipment record not found");
    }

    const previousStatus = shipment.shipmentStatus;
    const updatedShipment = shipment.isTestMode
        ? await syncTestShipment(shipment)
        : await syncShipmentFromDhl(shipment);

    if (updatedShipment.shipmentStatus !== previousStatus) {
        await syncOrderFromShipment(order, updatedShipment);
        try {
            await sendShipmentStatusEmail({
                order,
                shipment: updatedShipment,
                previousStatus,
                currentStatus: updatedShipment.shipmentStatus
            });
        } catch (error) {
            console.error("[Shipment Email] Failed to send status update:", error.message);
        }
    }

    return res.status(200).json(
        new ApiResponse(200, updatedShipment, "Shipment status synced successfully")
    );
});

const getAdminShipments = asyncHandler(async (req, res) => {
    const shipments = await Shipment.find()
        .populate({
            path: "order",
            populate: {
                path: "user",
                select: "fullName username email"
            }
        })
        .sort("-updatedAt");

    const serializedShipments = shipments.map((shipment) => serializeShipment(shipment));

    const summary = {
        totalShipments: serializedShipments.length,
        deliveredShipments: serializedShipments.filter((shipment) => shipment.shipmentStatus === "Delivered").length,
        openShipments: serializedShipments.filter((shipment) =>
            !["Delivered", "Exception"].includes(shipment.shipmentStatus)
        ).length
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            { shipments: serializedShipments, summary },
            "Shipment records fetched successfully"
        )
    );
});

const updateAdminShipment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const {
        courierName,
        trackingNumber,
        shipmentStatus,
        estimatedDeliveryDate,
        description,
        location,
        isTestMode
    } = req.body;

    const order = await Order.findById(orderId).populate("user", "fullName username email");
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    let shipment = await Shipment.findOne({ order: order._id });
    const wasNewShipment = !shipment;

    if (!shipment) {
        shipment = await Shipment.create({
            order: order._id,
            courierName: normalizeShipmentInput(courierName) || "DHL",
            trackingNumber: normalizeShipmentInput(trackingNumber),
            shipmentStatus: shipmentStatus || "Created",
            estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : undefined,
            isTestMode: typeof isTestMode === "boolean" ? isTestMode : true,
            trackingEvents: []
        });
    } else {
        if (typeof courierName === "string" && courierName.trim()) {
            shipment.courierName = courierName.trim();
        }

        if (typeof trackingNumber === "string") {
            shipment.trackingNumber = trackingNumber.trim();
        }

        if (typeof shipmentStatus === "string" && shipmentStatus.trim()) {
            shipment.shipmentStatus = shipmentStatus.trim();
        }

        if (estimatedDeliveryDate) {
            shipment.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
        }

        if (typeof isTestMode === "boolean") {
            shipment.isTestMode = isTestMode;
        }
    }

    const previousStatus = shipment.shipmentStatus;
    const normalizedStatus = normalizeShipmentInput(shipmentStatus);
    const statusChanged = normalizedStatus && previousStatus !== normalizedStatus;

    if (statusChanged) {
        shipment.trackingEvents.push({
            status: normalizedStatus,
            description: description?.trim() || `Shipment status updated to ${normalizedStatus}`,
            location: location?.trim() || "",
            eventTime: new Date()
        });
    } else if (description?.trim() || location?.trim()) {
        shipment.trackingEvents.push({
            status: shipment.shipmentStatus,
            description: description?.trim() || `Shipment updated for order ${order._id}`,
            location: location?.trim() || "",
            eventTime: new Date()
        });
    }

    shipment.lastSyncedAt = new Date();

    if (shipment.shipmentStatus === "Delivered" && !shipment.deliveredAt) {
        shipment.deliveredAt = new Date();
    }

    const savedShipment = await shipment.save();

    await syncOrderFromShipment(order, savedShipment);

    if (wasNewShipment) {
        try {
            await sendShipmentCreatedEmail({
                order,
                shipment: savedShipment
            });
        } catch (error) {
            console.error("[Shipment Email] Failed to send created email:", error.message);
        }
    }

    if (statusChanged) {
        try {
            await sendShipmentStatusEmail({
                order,
                shipment: savedShipment,
                previousStatus,
                currentStatus: savedShipment.shipmentStatus
            });
        } catch (error) {
            console.error("[Shipment Email] Failed to send status update:", error.message);
        }
    }

    return res.status(200).json(
        new ApiResponse(200, serializeShipment(savedShipment), "Shipment updated successfully")
    );
});

export {
    getShipmentDetails,
    syncShipmentStatus,
    getAdminShipments,
    updateAdminShipment
};
