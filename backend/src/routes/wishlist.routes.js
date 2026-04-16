import { Router } from "express";
import { toggleWishlist, getUserWishlist } from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);

router.route("/get-wishlist").get(getUserWishlist);
router.route("/toggle/:productId").post(toggleWishlist);

export default router;