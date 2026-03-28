import {ApiError} from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";

export const authorizeRoles = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthenticated: Please login first");
        }
        
        const hasPermission = req.user.role.some(role => allowedRoles.includes(role));

        if (!hasPermission) {
            throw new ApiError(
                403, 
                `Access Denied: Your roles [${req.user.role}] are not authorized`
            );
        }

        next();
    });
};
