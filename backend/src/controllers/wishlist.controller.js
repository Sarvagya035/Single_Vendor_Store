import { Wishlist } from "../models/wishlist.model.js";
import { Product } from "../models/product.model.js";

// Toggle product in wishlist (Add if not present, Remove if present)
const toggleWishlist = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let wishlist = await Wishlist.findOne({ owner: userId });

    if (!wishlist) {
        // Create new wishlist if it doesn't exist
        wishlist = await Wishlist.create({
            owner: userId,
            products: [productId]
        });
        return res.status(200).json({ message: "Added to wishlist", wishlist });
    }

    const isAdded = wishlist.products.includes(productId);

    if (isAdded) {
        // Remove product
        wishlist.products.pull(productId);
        await wishlist.save();
        return res.status(200).json({ message: "Removed from wishlist", wishlist });
    } else {
        // Add product
        wishlist.products.push(productId);
        await wishlist.save();
        return res.status(200).json({ message: "Added to wishlist", wishlist });
    }
};

const getUserWishlist = async (req, res) => {
    const wishlist = await Wishlist.findOne({ owner: req.user._id })
        .populate("products", "productName mainImages basePrice variants");

    if (!wishlist) {
        return res.status(200).json({ products: [] });
    }

    return res.status(200).json(wishlist);
};

export { toggleWishlist, getUserWishlist };