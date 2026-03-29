import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
    
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    orderItems: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            variantId: {
                type: Schema.Types.ObjectId,
                required: true
            },
            name: { type: String, required: true }, // Snapshot
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }, // Price at time of purchase
            variantImage: { type: String },
            sku: String,
            orderItemStatus: {
                type: String,
                enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
                default: "Processing"
            }
        }
    ],

    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        phone: { type: String, required: true }
    },

    paymentInfo: {
        id: { type: String }, // Transaction ID
        status: { type: String, default: "Pending" },
        method: { type: String, enum: ["COD", "Online"], default: "Online" }
    },

    itemsPrice: { type: Number, required: true, default: 0 },

    taxPrice: { type: Number, required: true, default: 0 },

    shippingPrice: { type: Number, required: true, default: 0 },

    totalAmount: { type: Number, required: true, default: 0 },

    orderStatus: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Processing"
    },

    paidAt: Date,

    deliveredAt: Date
    
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
