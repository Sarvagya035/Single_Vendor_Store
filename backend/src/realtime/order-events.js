import { emitToRole, emitToUser, emitToVendor } from "./socket.js";

const toPlainOrder = (orderDoc) => {
    if (!orderDoc) {
        return null;
    }

    return orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
};

const getCustomerId = (order) => order?.user?._id?.toString?.() || order?.user?.toString?.() || "";

const getCustomerName = (order) => {
    if (!order?.user || typeof order.user !== "object") {
        return "";
    }

    return order.user.fullName || order.user.username || order.user.email || "";
};

const getVendorIds = (order) => {
    const vendorIds = new Set();

    for (const item of order?.orderItems || []) {
        const vendorId = item?.vendor?._id?.toString?.() || item?.vendor?.toString?.() || "";
        if (vendorId) {
            vendorIds.add(vendorId);
        }
    }

    return [...vendorIds];
};

const getItemsForVendor = (order, vendorId) =>
    (order?.orderItems || []).filter((item) => {
        const itemVendorId = item?.vendor?._id?.toString?.() || item?.vendor?.toString?.() || "";
        return itemVendorId === vendorId;
    });

const buildOrderSummary = (order, extra = {}) => {
    const orderId = order?._id?.toString?.() || order?._id || "";
    const orderNumber = orderId ? orderId.slice(-8).toUpperCase() : "--------";

    return {
        eventId: extra.eventId || `order:${orderId}:${extra.kind || "update"}`,
        orderId,
        orderNumber,
        customerId: getCustomerId(order),
        customerName: getCustomerName(order),
        orderStatus: order?.orderStatus || "Processing",
        totalAmount: Number(order?.totalAmount || 0),
        itemCount: (order?.orderItems || []).length,
        previousStatus: extra.previousStatus || "",
        ...extra
    };
};

const emitOrderCreatedRealtime = (orderDoc) => {
    const order = toPlainOrder(orderDoc);

    if (!order?._id) {
        return false;
    }

    const summary = buildOrderSummary(order, {
        eventId: `order:${order._id}:new`,
        kind: "new"
    });

    emitToRole("admin", "order:new", summary);
    emitToRole("admin", "notification:new", {
        ...summary,
        eventId: `order:${order._id}:new`,
        title: "New order received",
        message: `Order #${summary.orderNumber} has been placed.`,
        targetAudience: "admin"
    });

    for (const vendorId of getVendorIds(order)) {
        const vendorItems = getItemsForVendor(order, vendorId);
        const vendorPayload = {
            ...summary,
            vendorId,
            items: vendorItems,
            itemCount: vendorItems.length,
            eventId: `order:${order._id}:new`
        };

        emitToVendor(vendorId, "order:new", vendorPayload);
        emitToVendor(vendorId, "notification:new", {
            ...vendorPayload,
            eventId: `order:${order._id}:new`,
            title: "New order received",
            message: `Order #${summary.orderNumber} includes ${vendorItems.length} item(s) for your store.`,
            targetAudience: "vendor"
        });
    }

    return true;
};

const emitOrderStatusUpdatedRealtime = (orderDoc, extra = {}) => {
    const order = toPlainOrder(orderDoc);

    if (!order?._id) {
        return false;
    }

    const summary = buildOrderSummary(order, {
        eventId: `order:${order._id}:status:${order.orderStatus}`,
        kind: "status-updated",
        ...extra
    });

    const customerId = summary.customerId;
    if (customerId) {
        emitToUser(customerId, "order:status-updated", summary);
        emitToUser(customerId, "notification:new", {
            ...summary,
            eventId: `order:${order._id}:status:${order.orderStatus}`,
            title: "Order status updated",
            message: `Your order #${summary.orderNumber} is now ${summary.orderStatus}.`,
            targetAudience: "customer"
        });
    }

    for (const vendorId of getVendorIds(order)) {
        const vendorItems = getItemsForVendor(order, vendorId);
        emitToVendor(vendorId, "order:status-updated", {
            ...summary,
            vendorId,
            items: vendorItems,
            itemCount: vendorItems.length,
            eventId: `order:${order._id}:status:${order.orderStatus}`
        });
    }

    return true;
};

export {
    buildOrderSummary,
    emitOrderCreatedRealtime,
    emitOrderStatusUpdatedRealtime
};
