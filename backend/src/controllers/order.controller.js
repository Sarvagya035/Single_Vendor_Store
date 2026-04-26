import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { razorpayInstance } from "../utils/razorpay.js";
import { Cart } from "../models/cart.model.js";
import { Vendor } from "../models/vendor.model.js";
import { Shipment } from "../models/shipment.model.js";
import crypto from "crypto";
import { createShipmentForOrder } from "../services/dhl.service.js";
import { sendShipmentCreatedEmail } from "../utils/shipmentNotifications.js";
import { syncLowStockNotificationsForProduct } from "../utils/vendorNotifications.js";

const cloneOrderWithItems = (orderDoc, filteredItems) => {
    const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
    order.orderItems = filteredItems;
    return order;
};

const calculateOrderStatusFromItems = (items = []) => {
    if (!items.length) return "Processing";

    if (items.every((item) => item.orderItemStatus === "Cancelled")) {
        return "Cancelled";
    }

    if (items.every((item) => item.orderItemStatus === "Delivered")) {
        return "Delivered";
    }

    if (items.every((item) => ["Shipped", "Delivered"].includes(item.orderItemStatus))) {
        return "Shipped";
    }

    return "Processing";
};

const PENDING_ORDER_EXPIRY_MS = Number(process.env.ORDER_PENDING_EXPIRY_MS || 15 * 60 * 1000);

const isExpiredPendingOrder = (order) => {
    if (!order || order.paymentInfo?.status !== "Pending") {
        return false;
    }

    const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : 0;
    if (!createdAt) {
        return false;
    }

    return Date.now() - createdAt > PENDING_ORDER_EXPIRY_MS;
};

const cleanupExpiredPendingOrders = async (userId) => {
    const cutoff = new Date(Date.now() - PENDING_ORDER_EXPIRY_MS);

    await Order.deleteMany({
        user: userId,
        "paymentInfo.status": "Pending",
        createdAt: { $lt: cutoff }
    });
};

const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress } = req.body;

    if (!orderItems || orderItems.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    let totalAmount = 0;
    const finalOrderItems = [];

    // Step 1: Validate Prices & Data (No Stock Update here)
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        const variant = product.variants.id(item.variantId);

        if (!variant || variant.productStock < item.quantity) {
            throw new ApiError(400, `${product.productName} is currently out of stock`);
        }

        const snapshotPrice = Number(item.priceAtAddition || 0);
        const price = snapshotPrice > 0
            ? snapshotPrice
            : variant.productPrice - (variant.productPrice * (variant.discountPercentage / 100));
        totalAmount += price * item.quantity;

        finalOrderItems.push({
            product: product._id,
            variantId: variant._id,
            name: product.productName,
            quantity: item.quantity,
            price: price,
            vendor: product.vendor
        });
    }

    // Add Shipping only
    const shippingPrice = totalAmount > 1000 ? 0 : 50;
    const finalTotal = totalAmount + shippingPrice;

    // Step 2: Create Razorpay Order
    const razorOrder = await razorpayInstance.orders.create({
        amount: finalTotal * 100,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`
    });

    // Step 3: Save Order in DB as "Pending"
    const order = await Order.create({
        user: req.user._id,
        orderItems: finalOrderItems,
        shippingAddress,
        itemsPrice: totalAmount, 
        shippingPrice,
        totalAmount: finalTotal,
        paymentInfo: { id: razorOrder.id, status: "Pending" }
    });

    return res.status(201).json(
        new ApiResponse(201, { orderId: order._id, razorOrder }, "Order initiated. Pending payment.")
    );
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Step 1: Verify Signature (Standard Crypto Logic)
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");

    if (razorpay_signature !== expectedSign) {
        throw new ApiError(400, "Payment verification failed. Invalid signature.");
    }

    // Step 2: Find the Order
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order record not found.");

    // Step 3: Atomic Stock Check & Update
    for (const item of order.orderItems) {
        const updatedProduct = await Product.findOneAndUpdate(
            { 
                _id: item.product, 
                "variants._id": item.variantId,
                "variants.productStock": { $gte: item.quantity } // ONLY update if enough stock
            },
            { 
                $inc: { "variants.$.productStock": -item.quantity } 
            },
            { returnDocument: 'after' }
        );

        if (!updatedProduct) {
            // Very rare case: Someone else bought it while you were paying
            // Here you would normally trigger a refund logic
            throw new ApiError(400, "Payment successful, but item went out of stock. Contact support for refund.");
        }

        await syncLowStockNotificationsForProduct(updatedProduct);
    }

    // Step 4: Finalize Order
    order.paymentInfo.status = "Paid";
    order.paymentInfo.paymentId = razorpay_payment_id;
    order.orderStatus = "Processing";
    order.paidAt = Date.now();
    await order.save();

    // Step 5: Clear User's Cart
    await Cart.findOneAndDelete({ user: req.user._id });

    const notifiedOrder = await Order.findById(order._id).populate("user", "fullName username email");
    let shipment = null;

    try {
        shipment = await createShipmentForOrder(notifiedOrder);
    } catch (error) {
        console.error("Shipment creation failed:", error.message);
    }

    if (shipment) {
        try {
            await sendShipmentCreatedEmail({
                order: notifiedOrder,
                shipment
            });
        } catch (error) {
            console.error("Shipment created email failed:", error.message);
        }
    }

    const responseOrder = order.toObject ? order.toObject() : { ...order };
    responseOrder.shipment = shipment ? (shipment.toObject ? shipment.toObject() : { ...shipment }) : null;

    return res.status(200).json(
        new ApiResponse(200, responseOrder, "Payment verified and inventory updated!")
    );
});

// Update Order Status (Shipped, Delivered etc.)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status, orderItemId } = req.body; // e.g., "Shipped", "Delivered", "Cancelled"

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) throw new ApiError(404, "Vendor profile not found");

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    const orderItem = order.orderItems.id(orderItemId);
    if (!orderItem) throw new ApiError(404, "Order item not found");

    if (orderItem.vendor?.toString() !== vendor._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this order item");
    }

    if (orderItem.orderItemStatus === "Delivered") {
        throw new ApiError(400, "Order item is already delivered");
    }

    orderItem.orderItemStatus = status;
    order.orderStatus = calculateOrderStatusFromItems(order.orderItems);

    if (order.orderStatus === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Paid"; // Final confirmation
    }

    await order.save();

    const filteredItems = order.orderItems.filter(
        (item) => item.vendor?.toString() === vendor._id.toString()
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            cloneOrderWithItems(order, filteredItems),
            `Order item status updated to ${status}`
        )
    );
});

// Get all orders of the logged-in user
const getMyOrders = asyncHandler(async (req, res) => {
    await cleanupExpiredPendingOrders(req.user._id);

    const orders = await Order.find({
        user: req.user._id,
        "paymentInfo.status": { $ne: "Pending" }
    }).sort("-createdAt");

    return res.status(200).json(
        new ApiResponse(200, orders, "User orders fetched successfully")
    );
});

// Get a single order details
const getOrderDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId).populate("user", "fullName email");
    
    if (!order) throw new ApiError(404, "Order not found");

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const isCustomerOrder = order.user._id.toString() === req.user._id.toString();
    const isAdmin = userRoles.includes("admin");
    const isVendor = userRoles.includes("vendor");

    if (isExpiredPendingOrder(order) && isCustomerOrder && !isAdmin && !isVendor) {
        await Order.deleteOne({ _id: order._id });
        throw new ApiError(404, "Order not found");
    }

    if (isAdmin) {
        const shipment = await Shipment.findOne({ order: order._id });
        const orderData = order.toObject();
        orderData.shipment = shipment ? shipment.toObject() : null;

        return res.status(200).json(
            new ApiResponse(200, orderData, "Order details fetched")
        );
    }

    if (isCustomerOrder) {
        const shipment = await Shipment.findOne({ order: order._id });
        const orderData = order.toObject();
        orderData.shipment = shipment ? shipment.toObject() : null;

        return res.status(200).json(
            new ApiResponse(200, orderData, "Order details fetched")
        );
    }

    if (isVendor) {
        const vendor = await Vendor.findOne({ user: req.user._id });

        if (vendor) {
            const vendorItems = order.orderItems.filter(
                (item) => item.vendor?.toString() === vendor._id.toString()
            );

            if (vendorItems.length) {
                const shipment = await Shipment.findOne({ order: order._id });

                return res.status(200).json(
                    new ApiResponse(
                        200,
                        {
                            ...cloneOrderWithItems(order, vendorItems),
                            shipment: shipment ? shipment.toObject() : null
                        },
                        "Order details fetched"
                    )
                );
            }
        }
    }

    throw new ApiError(403, "Unauthorized access to this order");

});

// Cancel Order (User can only cancel if status is 'Processing')
const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.orderStatus !== "Processing") {
        throw new ApiError(400, "Order cannot be cancelled at this stage");
    }

    for (const item of order.orderItems) {
        await Product.updateOne(
            { _id: item.product, "variants._id": item.variantId },
            { $inc: { "variants.$.productStock": item.quantity } }
        );

        await syncLowStockNotificationsForProduct(item.product);
    }

    order.orderStatus = "Cancelled";
    await order.save();

    return res.status(200).json(
        new ApiResponse(200, order, "Order cancelled and stock restored")
    );
});

// Get orders belonging to a specific Vendor
const getVendorOrders = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
        throw new ApiError(404, "Vendor profile not found");
    }

    const orders = await Order.find({
        "orderItems.vendor": vendor._id
    })
        .populate("user", "fullName email")
        .sort("-createdAt");

    const vendorOrders = orders
        .map((order) => {
            const filteredItems = order.orderItems.filter(
                (item) => item.vendor?.toString() === vendor._id.toString()
            );

            if (!filteredItems.length) {
                return null;
            }

            return cloneOrderWithItems(order, filteredItems);
        })
        .filter(Boolean);

    return res.status(200).json(
        new ApiResponse(200, vendorOrders, "Vendor orders fetched successfully")
    );
});

const getCustomerOrdersForVendor = asyncHandler(async (req, res) => {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ApiError(400, "Invalid customer id");
    }

    const orders = await Order.find({ user: customerId })
        .populate("user", "fullName username email")
        .sort("-createdAt");

    return res.status(200).json(
        new ApiResponse(200, orders, "Customer order history fetched successfully")
    );
});

// Get every single order (For Admin Dashboard)
const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().populate("user", "fullName email").sort("-createdAt");
    
    // Summary calculation for Admin
    const totalRevenue = orders.reduce((sum, order) => 
        order.paymentInfo.status === "Paid" ? sum + order.totalAmount : sum, 0
    );

    return res.status(200).json(
        new ApiResponse(200, { orders, totalRevenue }, "All orders fetched for Admin")
    );
});

export {
    createOrder,
    verifyPayment,
    updateOrderStatus,
    getMyOrders,
    getOrderDetails,
    cancelOrder,
    getVendorOrders,
    getCustomerOrdersForVendor,
    getAllOrders,
    
}
