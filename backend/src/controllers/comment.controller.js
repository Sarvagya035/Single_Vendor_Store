import mongoose from "mongoose";
import {Comment} from "../models/comment.model.js"
import {Product} from "../models/product.model.js"
import {Order} from "../models/order.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addOrUpdateReview = asyncHandler(async (req, res) => {
    const { productId, title, commentBody, rating, reviewImages} = req.body;

    // 1. Verified Buyer Check
    const hasOrdered = await Order.findOne({
        user: req.user._id,
        orderItems: {
            $elemMatch: {
                product: productId,
                orderItemStatus: "Delivered"
            }
        }
    });

    if (!hasOrdered) {
        throw new ApiError(403, "You can only review products you have purchased and received.");
    }

    // 2. Add or Update the Comment
    const review = await Comment.findOneAndUpdate(
        { user: req.user._id, product: productId }, // Find by this
        { 
            title, 
            commentBody, 
            rating,
            reviewImages: reviewImages || [],
        },
        { returnDocument: "after", upsert: true, runValidators: true } 
    );

    const allReviews = await Comment.find({ product: productId });
    
    const numberOfReviews = allReviews.length;
    let avgRating = 0;

    if (numberOfReviews > 0) {
        avgRating = allReviews.reduce((sum, item) => item.rating + sum, 0) / numberOfReviews;
    }
    await Product.findByIdAndUpdate(productId, {
        averageRating: Number(avgRating.toFixed(1)), 
        numberOfReviews: numberOfReviews
    });

    return res.status(200).json(
        new ApiResponse(200, review, "Review submitted and product rating updated!")
    );
});

const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const reviews = await Comment.find({ product: productId })
        .populate("user", "username avatar email") 
        .sort("-createdAt"); 

    return res.status(200).json(
        new ApiResponse(
            200, 
            reviews, 
            reviews.length > 0 ? "Reviews fetched successfully" : "No reviews for this product yet"
        )
    );
});

const getReviewStats = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const stats = await Comment.aggregate([
        {
            $match: { product: new mongoose.Types.ObjectId(productId) }
        },
        {
            $group: {
                _id: "$rating",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id": -1 } // 5 to 1 star
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, stats, "Rating stats fetched successfully")
    );
});

export { addOrUpdateReview, getProductReviews, getReviewStats};
