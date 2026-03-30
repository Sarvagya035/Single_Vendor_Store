import mongoose from "mongoose"

const connectDB = async ()=>{
    try {
       
       const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
        console.log(`\nMONGO_DB Connected!! DB Host:- ${connectionInstance.connection.host}`)

    } catch (error) {
        console.log("Mongo DB connection failed", error)
        process.exit(1)
    }
}

export default connectDB