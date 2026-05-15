import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js"
import { createOriginChecker } from "./utils/origin.js"

//router imports begin here
import userRouter from "./routes/user.routes.js"
import addressRouter from "./routes/address.routes.js"
import adminRouter from "./routes/admin.routes.js"
import categoryRouter from "./routes/category.routes.js"
import productRouter from "./routes/product.routes.js"
import cartRouter from "./routes/cart.routes.js"
import orderRouter from "./routes/order.routes.js"
import commentRouter from "./routes/comment.routes.js"
import wishlistRouter from "./routes/wishlist.routes.js"
import bulkInquiryRouter from "./routes/bulkInquiry.routes.js"

const app = express()

const corsOptions = {
    origin: createOriginChecker(),
    credentials: true
}

const authRouteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
})

const rateLimitPaths = new Set([
    "/api/v1/users/register",
    "/api/v1/users/login",
    "/api/v1/users/forgot-password",
    "/api/v1/users/refresh-token"
])

app.use((req, res, next) => {
    const normalizedPath = String(req.path || "").replace(/\/$/, "")

    if (req.method === "POST" && rateLimitPaths.has(normalizedPath)) {
        return authRouteLimiter(req, res, next)
    }

    return next()
})

app.use(helmet())
app.set("trust proxy", 1)

app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.json({limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors(corsOptions))


// Routes declaration starts here
app.use("/api/v1/users", userRouter)
app.use("/api/v1/address",addressRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/wishlist", wishlistRouter)
app.use("/api/v1/bulk-inquiries", bulkInquiryRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export { app }
