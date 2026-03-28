import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: "./.env"
})

// console.log(process.env.MONGO_URI)

connectDB()
    .then(
        () => {
            app.listen(process.env.PORT || 3000, () => {
                console.log(`Server is Running at port: ${process.env.PORT}`)
            })
        }
    ).catch((error) => {
        console.log("MONGO DB Connection failed !!", error)
    })