import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import { ApiError } from "../utils/ApiError.js"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {

    try {

        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File successfully uploaded on cloudinary")

        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {

        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error(error)
        throw new ApiError(500, "File Upload Failed")
    }
}

export { uploadOnCloudinary }
