import { ApiError } from "../utils/ApiError.js";

const isProduction = process.env.NODE_ENV === "production";

const normalizeErrors = (errors) => {
    if (!errors) {
        return [];
    }

    if (Array.isArray(errors)) {
        return errors;
    }

    if (typeof errors === "string") {
        return [errors];
    }

    return Object.values(errors).flat().filter(Boolean);
};

const getFriendlyError = (error) => {
    if (error instanceof ApiError) {
        return {
            statusCode: error.statusCode || 500,
            message: error.message || "Something went wrong",
            errors: normalizeErrors(error.errors)
        };
    }

    if (error?.name === "ValidationError") {
        return {
            statusCode: 400,
            message: "Please check the highlighted fields and try again.",
            errors: Object.values(error.errors || {}).map((item) => item.message)
        };
    }

    if (error?.name === "CastError") {
        return {
            statusCode: 400,
            message: "The provided identifier is invalid.",
            errors: [`Invalid ${error.path || "resource"} provided.`]
        };
    }

    if (error?.code === 11000) {
        const duplicateField = Object.keys(error.keyValue || {})[0];
        return {
            statusCode: 409,
            message: "A record with the same value already exists.",
            errors: duplicateField
                ? [`${duplicateField} already exists.`]
                : ["Duplicate value detected."]
        };
    }

    if (error?.name === "JsonWebTokenError") {
        return {
            statusCode: 401,
            message: "Your session is invalid. Please sign in again.",
            errors: ["Authentication token could not be verified."]
        };
    }

    if (error?.name === "TokenExpiredError") {
        return {
            statusCode: 401,
            message: "Your session has expired. Please sign in again.",
            errors: ["Authentication token has expired."]
        };
    }

    if (error?.code === "LIMIT_FILE_SIZE") {
        return {
            statusCode: 400,
            message: "The uploaded file is too large.",
            errors: ["Please choose a smaller file."]
        };
    }

    return {
        statusCode: error?.statusCode || 500,
        message: isProduction ? "Internal server error" : error?.message || "Internal server error",
        errors: normalizeErrors(error?.errors)
    };
};

const notFoundHandler = (req, res, next) => {
    next(new ApiError(404, "The requested resource was not found."));
};

const errorHandler = (error, req, res, next) => {
    const friendlyError = getFriendlyError(error);
    const statusCode = friendlyError.statusCode || 500;
    const isExpectedClientError = statusCode < 500;

    if (statusCode >= 500) {
        console.error(error);
    } else if (!isProduction && !isExpectedClientError) {
        console.error(error);
    }

    const response = {
        success: false,
        message: friendlyError.message,
        errors: friendlyError.errors || []
    };

    if (!isProduction && error?.stack) {
        response.stack = error.stack;
    }

    return res.status(statusCode).json(response);
};

export { errorHandler, notFoundHandler };
