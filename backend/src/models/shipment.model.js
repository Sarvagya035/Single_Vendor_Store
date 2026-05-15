import mongoose, { Schema } from "mongoose";

const shipmentEventSchema = new Schema(
    {
        status: { type: String, required: true },
        description: { type: String },
        location: { type: String },
        eventTime: { type: Date, default: Date.now }
    },
    { _id: false }
);

const shipmentSchema = new Schema(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true
        },
        courierName: {
            type: String,
            default: "DHL"
        },
        trackingNumber: {
            type: String,
            default: ""
        },
        shipmentStatus: {
            type: String,
            enum: ["Created", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "Exception"],
            default: "Created"
        },
        estimatedDeliveryDate: {
            type: Date
        },
        deliveredAt: {
            type: Date
        },
        lastSyncedAt: {
            type: Date
        },
        isTestMode: {
            type: Boolean,
            default: true
        },
        trackingEvents: [shipmentEventSchema],
        rawResponse: {
            type: Schema.Types.Mixed
        }
    },
    { timestamps: true }
);

export const Shipment = mongoose.model("Shipment", shipmentSchema);
