import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Product} from "../models/product.model.js"
import { Cart } from "../models/cart.model.js";

const addToCart = asyncHandler(async (req, res) => {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user._id;

    // 1. Fetch Latest Product Data
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    // 2. Find Specific Variant
    const variant = product.variants.id(variantId);
    if (!variant) throw new ApiError(404, "Variant not found");

    // 3. Check Stock
    if (variant.productStock < quantity) {
        throw new ApiError(400, "Not enough stock available");
    }

    // 4. Find User's Cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        // Create new cart if doesn't exist
        cart = await Cart.create({
            user: userId,
            cartItems: [{
                product: productId,
                variantId,
                quantity,
                priceAtAddition: variant.finalPrice // Snapshot for history
            }]
        });
    } else {
        // Check if same variant already in cart
        const itemIndex = cart.cartItems.findIndex(
            item => item.variantId.toString() === variantId.toString()
        );

        if (itemIndex > -1) {
            const nextQuantity = cart.cartItems[itemIndex].quantity + Number(quantity);
            if (variant.productStock < nextQuantity) {
                throw new ApiError(400, `Only ${variant.productStock} units available in stock`);
            }
            // Update quantity
            cart.cartItems[itemIndex].quantity = nextQuantity;
        } else {
            // Add new item
            cart.cartItems.push({
                product: productId,
                variantId,
                quantity,
                priceAtAddition: variant.finalPrice
            });
        }
    }

    await cart.save();
    return res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

const getCart = asyncHandler(async (req, res) => {
    // 1. Find cart and populate product details
    const cart = await Cart.findOne({ user: req.user._id }).populate("cartItems.product");

    if (!cart) {
        return res.status(200).json(new ApiResponse(200, { cartItems: [], totalCartPrice: 0 }, "Cart is empty"));
    }

    let isPriceChanged = false;
    let itemsToRemove = [];

    //Loop through items to check latest price/stock
    cart.cartItems.forEach((item, index) => {
        const product = item.product;
        
        // Find the specific variant in the populated product
        const currentVariant = product.variants.id(item.variantId);

        if (!currentVariant || currentVariant.productStock === 0) {
            // Variant disappeared or Out of Stock - Mark for removal or alert
            itemsToRemove.push(index); 
        } else {
            // Check if price has changed since addition
            if (item.priceAtAddition !== currentVariant.finalPrice) {
                item.priceAtAddition = currentVariant.finalPrice; // Update to latest
                isPriceChanged = true;
            }
        }
    });

    cart.cartItems = cart.cartItems.filter((_, idx) => !itemsToRemove.includes(idx));

    if (isPriceChanged || itemsToRemove.length > 0) {
        await cart.save();
    }

    return res.status(200).json(
        new ApiResponse(
            200, 
            { 
                cart, 
                alerts: isPriceChanged ? "Some prices in your cart have been updated." : null 
            }, 
            "Cart fetched and synced"
        )
    );
});

const updateCartQuantity = asyncHandler(async (req, res) => {
    const { productId, variantId, action } = req.body; // action: "inc" or "dec"
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new ApiError(404, "Cart not found");

    const itemIndex = cart.cartItems.findIndex(
        item => item.variantId.toString() === variantId.toString()
    );

    if (itemIndex === -1) throw new ApiError(404, "Item not found in cart");

    const product = await Product.findById(productId);
    const variant = product?.variants.id(variantId);

    if (!variant) throw new ApiError(404, "Variant no longer exists");

    const currentItem = cart.cartItems[itemIndex];

    if (action === "inc") {
        if (variant.productStock <= currentItem.quantity) {
            throw new ApiError(400, `Only ${variant.productStock} units available in stock`);
        }
        currentItem.quantity += 1;
    } else if (action === "dec") {
        if (currentItem.quantity > 1) {
            currentItem.quantity -= 1;
        } else {
            cart.cartItems.splice(itemIndex, 1);
        }
    } else {
        throw new ApiError(400, "Invalid action. Use 'inc' or 'dec'");
    }

    if (cart.cartItems[itemIndex]) {
        cart.cartItems[itemIndex].priceAtAddition = variant.finalPrice;
    }
    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, `Quantity ${action === "inc" ? "increased" : "decreased"}`)
    );
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { variantId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemExists = cart.cartItems.some(
        (item) => item.variantId.toString() === variantId.toString()
    );

    if (!itemExists) {
        throw new ApiError(404, "Item not found in your cart");
    }

    cart.cartItems.pull({ variantId: variantId });

    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Item removed from cart successfully")
    );
});

const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
        throw new ApiError(404, "Cart already empty or not found");
    }

    cart.cartItems = [];
    cart.totalCartPrice = 0;
    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Cart cleared successfully")
    );
});

export {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
}
