import { Order } from "../models/order.model.js";

const SHIPMENT_TO_ORDER_STATUS = {
    Created: "Processing",
    "Picked Up": "Shipped",
    "In Transit": "Shipped",
    "Out for Delivery": "Shipped",
    Delivered: "Delivered",
    Exception: "Shipped"
};

const syncOrderFromShipment = async (orderOrId, shipment) => {
    if (!shipment) {
        return null;
    }

    const order = orderOrId?.save ? orderOrId : await Order.findById(orderOrId);
    if (!order) {
        return null;
    }

    const nextOrderStatus = SHIPMENT_TO_ORDER_STATUS[shipment.shipmentStatus] || order.orderStatus;

    if (nextOrderStatus === "Delivered") {
        order.orderStatus = "Delivered";
        order.deliveredAt = order.deliveredAt || shipment.deliveredAt || new Date();
        order.orderItems.forEach((item) => {
            if (item.orderItemStatus !== "Cancelled") {
                item.orderItemStatus = "Delivered";
            }
        });
    } else if (nextOrderStatus === "Shipped") {
        if (order.orderStatus !== "Delivered") {
            order.orderStatus = "Shipped";
            order.orderItems.forEach((item) => {
                if (item.orderItemStatus === "Processing") {
                    item.orderItemStatus = "Shipped";
                }
            });
        }
    } else if (nextOrderStatus === "Processing" && order.orderStatus === "Processing") {
        order.orderStatus = "Processing";
    }

    if (order.orderStatus === "Delivered") {
        order.paymentInfo.status = "Paid";
    }

    await order.save();
    return order;
};

export {
    syncOrderFromShipment,
    SHIPMENT_TO_ORDER_STATUS
};
