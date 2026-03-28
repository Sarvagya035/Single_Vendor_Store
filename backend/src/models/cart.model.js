import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    cartItems: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        variantId: {
            type: Schema.Types.ObjectId,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity cannot be less than 1"],
            default: 1
        },

        // Snapshot price (at the time of adding to cart)
        priceAtAddition: {
            type: Number,
            required: true
        }
    }],

    totalCartPrice: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

// Middleware: Auto-calculate totalCartPrice before saving
cartSchema.pre("save", async function() {
    this.totalCartPrice = this.cartItems.reduce((acc, item) => {
        return acc + (item.priceAtAddition * item.quantity);
    }, 0);
});

export const Cart = mongoose.model("Cart", cartSchema);