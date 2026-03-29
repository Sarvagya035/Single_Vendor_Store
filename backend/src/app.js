import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { ApiError } from "./utils/ApiError.js"

//router imports begin here
import userRouter from "./routes/user.routes.js"
import addressRouter from "./routes/address.routes.js"
import adminRouter from "./routes/admin.routes.js"
import categoryRouter from "./routes/category.routes.js"
import productRouter from "./routes/product.routes.js"
import cartRouter from "./routes/cart.routes.js"
import orderRouter from "./routes/order.routes.js"
import commentRouter from "./routes/comment.routes.js"

const app = express()

const humanizeMongoError = (err) => {
    if (!err) return null;

    if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyValue || {})[0];
        if (duplicateField === "phone") {
            return "This phone number is already registered. Please use a different number.";
        }
        if (duplicateField === "email") {
            return "This email address is already registered. Please sign in or use another email.";
        }
        return "This value is already in use. Please choose another one.";
    }

    if (err.name === "ValidationError" && err.errors) {
        const messages = Object.values(err.errors)
            .map((item) => item?.message)
            .filter(Boolean);
        if (messages.length > 0) {
            return messages.join(" ");
        }
    }

    return null;
}

app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.json({limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


// Routes declaration starts here
app.use("/api/v1/users", userRouter)
app.use("/api/v1/address",addressRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/product", productRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/comments", commentRouter)

app.use((err, req, res, next) => {
    const statusCode = err instanceof ApiError ? err.statusCode : err.statusCode || 500;
    const humanizedMessage = humanizeMongoError(err);
    const message = err instanceof ApiError
        ? err.message
        : humanizedMessage || err.message || "Internal Server Error";

    const isExpectedAuthError =
        statusCode === 401 &&
        err instanceof ApiError &&
        (message === "Unauthorized request" || message === "Invalid Access Token");

    if (!isExpectedAuthError && statusCode >= 500) {
        console.error(err);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
        data: null
    });
});

export { app }
