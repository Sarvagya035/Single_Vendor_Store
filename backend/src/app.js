import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js"

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

const app = express()

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
app.use("/api/v1/products", productRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/wishlist", wishlistRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export { app }
