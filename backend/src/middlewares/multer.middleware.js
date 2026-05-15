import multer from "multer"
import { ApiError } from "../utils/ApiError.js"

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb){
        const uniqueName = Date.now() + "-" + file.originalname
        cb(null, uniqueName)
    }
})

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
        return cb(new ApiError(
            400,
            "Invalid file type. Only JPEG, PNG, and WEBP images are allowed."
        ));
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
})
