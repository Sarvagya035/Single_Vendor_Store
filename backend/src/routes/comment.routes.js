import { Router } from "express"
import { addOrUpdateReview, getProductReviews, getReviewStats} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/add-review").post(verifyJWT,addOrUpdateReview)
router.route("/get-review/:productId").get(getProductReviews)
router.route("/stats/:productId").get(getReviewStats);

export default router