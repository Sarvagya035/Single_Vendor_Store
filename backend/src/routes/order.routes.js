import { Router } from "express";
import { 
    createOrder, 
    verifyPayment,
    getMyOrders,
    getOrderDetails,
    cancelOrder,
    updateOrderStatus,
    getAllOrders,
    deleteOrderByAdmin

} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {authorizeRoles} from "../middlewares/authorization.middleware.js"

const router = Router();

// Sabhi order routes ke liye user ka login hona zaroori hai
router.use(verifyJWT); 

// 1. POST: /api/v1/orders/checkout
router.route("/checkout").post(createOrder);

// 2. POST: /api/v1/orders/verify-payment
router.route("/verify-payment").post(verifyPayment);

router.route("/my-orders").get(getMyOrders);
router.route("/order/:orderId").get(getOrderDetails);
router.route("/cancel/:orderId").put(cancelOrder);

router.route("/update-status/:orderId").put(authorizeRoles("admin"), updateOrderStatus);
router.route("/admin/delete-order/:orderId").delete(authorizeRoles("admin"), deleteOrderByAdmin);

router.route("/admin/all-orders").get(authorizeRoles("admin"), getAllOrders);

export default router;  
