class ApiError extends Error {
    constructor(statusCode = 500, message = "Something went wrong", errors = [], stack = "") {
        super(message);

        this.name = "ApiError";
        this.statusCode = statusCode;
        this.success = false;
        this.errors = Array.isArray(errors) ? errors : [errors].filter(Boolean);

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
