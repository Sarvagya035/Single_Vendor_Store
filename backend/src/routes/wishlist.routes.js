import { Router } from "express";
import { toggleWishlist, getUserWishlist, getCustomerWishlistForVendor } from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);

router.route("/get-wishlist").get(getUserWishlist);
router.route("/toggle/:productId").post(toggleWishlist);
router.route("/vendor/customer/:customerId").get(authorizeRoles("vendor", "admin"), getCustomerWishlistForVendor);

export default router;
