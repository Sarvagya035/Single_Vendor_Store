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

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }

        return response;

    } catch (error) {

        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        throw new ApiError(500, error?.message || "File Upload Failed")
    }
}

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) {
        return null
    }

    try {
        return await cloudinary.uploader.destroy(publicId, {
            resource_type: "image"
        })
    } catch (error) {
        throw new ApiError(500, error?.message || "Cloudinary cleanup failed")
    }
}

export { uploadOnCloudinary, deleteCloudinaryImage }
