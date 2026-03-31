import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, _, next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if(!token){
        throw new ApiError(401, "You need to sign in to continue.")
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401, "Your session is no longer valid. Please sign in again.")
        }

        req.user = user
        next()
    } catch (error) {
        throw error instanceof ApiError
            ? error
            : new ApiError(401, "Your session is invalid or expired. Please sign in again.")
    }
})
