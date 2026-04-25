import { Router } from "express";
import { toggleWishlist, getUserWishlist, getCustomerWishlistForVendor, mergeGuestWishlist } from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/get-wishlist").get(authorizeRoles("customer"), getUserWishlist);
router.route("/toggle/:productId").post(authorizeRoles("customer"), toggleWishlist);
router.route("/merge-guest-wishlist").post(authorizeRoles("customer"), mergeGuestWishlist);
router.route("/vendor/customer/:customerId").get(authorizeRoles("vendor", "admin"), getCustomerWishlistForVendor);

export default router;
