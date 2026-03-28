import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const productSchema = new Schema({

    productName: { 
        type: String, 
        required: [true, "Product name is required"], 
        trim: true 
    },

    productDescription: { 
        type: String, 
        required: [true, "Description is required"] 
    },

    brand: { 
        type: String, 
        trim: true,
        default: "Generic"
    },

    vendor: { 
        type: Schema.Types.ObjectId, 
        ref: "Vendor", 
        required: true 
    },

    category: { 
        type: Schema.Types.ObjectId, 
        ref: "Category", 
        required: true 
    },

    // Global images for the product card/gallery

    mainImages: [{ type: String, required: true }],

    variantOptions: [
        
        {
            name: { 
                type: String, 
                required: true 
            }, // e.g., "Size"
            
            values: [{ type: String, required: true }] // e.g., ["S", "M", "L"]
        }
    ],

    variants: [
        {
            attributes: {
                type: Map,
                of: String // e.g., { "Size": "M", "Color": "Red" }
            },

            productPrice: { type: Number, required: true, min: 0 },
            
            // --- DISCOUNT LOGIC ---
            discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
            finalPrice: { type: Number }, // (Price - Discount)
            
            productStock: { type: Number, required: true, min: 0 },
            isAvailable: { type: Boolean, default: true },
            
            sku: { type: String, sparse: true }, 
            variantImage: { type: String } 
        }
    ],

    // Still useful for "Starting at $X" in search results
    basePrice: {

        type: Number 
    }, 
    
    isActive: { 
        type: Boolean, 
        default: true 
    },

    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numberOfReviews: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

// Middleware to calculate Final Price and Base Price
productSchema.pre("save", async function() {

    if (!this.isModified('variants')) {
        return
    }

    if (this.variants && this.variants.length > 0) {
        this.variants.forEach(variant => {
            const discountAmount = (variant.productPrice * variant.discountPercentage) / 100;
            variant.finalPrice = Math.round(variant.productPrice - discountAmount);
            
            // Auto-set availability based on stock
            variant.isAvailable = variant.productStock > 0;
        });

        // Set basePrice to the lowest finalPrice available
        const finalPrices = this.variants.map(v => v.finalPrice);
        this.basePrice = Math.min(...finalPrices);
    }
});

productSchema.plugin(mongooseAggregatePaginate)

export const Product = mongoose.model("Product", productSchema)