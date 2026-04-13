import { Router } from "express"
import { addOrUpdateReview, deleteReview, getProductReviews, getReviewStats } from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/add-review").post(verifyJWT, upload.array("reviewImages", 5), addOrUpdateReview)
router.route("/delete-review/:productId").delete(verifyJWT, deleteReview)
router.route("/get-review/:productId").get(getProductReviews)
router.route("/stats/:productId").get(getReviewStats);

export default router
