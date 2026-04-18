import { Router } from "express";
import { 
    createOrder, 
    verifyPayment,
    getMyOrders,
    getOrderDetails,
    cancelOrder,
    getVendorOrders,
    getCustomerOrdersForVendor,
    updateOrderStatus,
    getAllOrders

} from "../controllers/order.controller.js";
import {
    getShipmentDetails,
    syncShipmentStatus
} from "../controllers/shipment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {authorizeRoles} from "../middlewares/authorization.middleware.js"

const router = Router();

router.use(verifyJWT); 

// 1. POST: /api/v1/orders/checkout
router.route("/checkout").post(createOrder);

// 2. POST: /api/v1/orders/verify-payment
router.route("/verify-payment").post(verifyPayment);

router.route("/my-orders").get(getMyOrders);
router.route("/order/:orderId").get(getOrderDetails);
router.route("/cancel/:orderId").put(cancelOrder);
router.route("/shipment/:orderId").get(getShipmentDetails);
router.route("/shipment/:orderId/sync").post(authorizeRoles("admin"), syncShipmentStatus);

router.route("/vendor-orders").get(authorizeRoles("vendor"), getVendorOrders);
router.route("/vendor/customer/:customerId").get(authorizeRoles("vendor", "admin"), getCustomerOrdersForVendor);
router.route("/vendor-update-status/:orderId").put(authorizeRoles("vendor"), updateOrderStatus);

router.route("/admin/all-orders").get(authorizeRoles("vendor"), getAllOrders);

export default router;  
