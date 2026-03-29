import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Important: Check Whether admin should not delete himself.
    if (user._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot delete your own admin account");
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json(
        new ApiResponse(200, null, "User deleted successfully")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const skip = (page - 1) * limit;

    
    const users = await User.find()
        .select("-password -refreshToken")
        .sort("-createdAt") // New users pehle dikhein
        .skip(skip)
        .limit(limit);

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }, "Users fetched with pagination")
    );
});


export {
    deleteUser,
    getAllUsers
}
