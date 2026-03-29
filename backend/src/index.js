import dotenv from "dotenv"

dotenv.config({
    path: "./.env",
    override: true
})

const [{ default: connectDB }, { app }] = await Promise.all([
    import("./db/index.js"),
    import("./app.js")
]);

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
