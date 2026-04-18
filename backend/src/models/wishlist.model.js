import mongoose, { Schema } from "mongoose";

const wishlistSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    products: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product"
            }
        ],
        default: []
    }
}, { timestamps: true });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
