import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {authorizeRoles} from "../middlewares/authorization.middleware.js"
import { addToCart, clearCart, getCart, mergeGuestCart, removeFromCart, updateCartQuantity } from "../controllers/cart.controller.js";

const router = Router()

router.route("/add-to-cart").post(
    verifyJWT,
    authorizeRoles("customer"),
    addToCart
)
router.route("/get-cart").get(
    verifyJWT,
    authorizeRoles("customer"),
    getCart
)
router.route("/merge-guest-cart").post(
    verifyJWT,
    authorizeRoles("customer"),
    mergeGuestCart
)
router.route("/update-cart").patch(
    verifyJWT,
    authorizeRoles("customer"),
    updateCartQuantity
)
router.route("/delete-cart/:variantId").delete(
    verifyJWT,
    authorizeRoles("customer"),
    removeFromCart
)
router.route("/clear-cart").delete(
    verifyJWT,
    authorizeRoles("customer"),
    clearCart
)



export default router
