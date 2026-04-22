import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import {
    getVendorDetails,  
    getVendorAnalytics, 
    getVendorSoldProducts, 
    getVendorNotifications,
    markAllVendorNotificationsRead,
    markVendorNotificationRead,
    setupInitialAdminAndStore,
    updateBankDetails,
    updateVendorDetails,
    updateVendorlogo
} from "../controllers/vendor.controller.js"
import {  
    deleteProductByAdmin, 
    downloadOrderReports,
    deleteUser, 
    getAllUsers, 
    toggleProductStatusByAdmin 
} from "../controllers/admin.Controllers.js";
import {
    getAdminShipments,
    updateAdminShipment
} from "../controllers/shipment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

/*

router.route("/pending").get(
    verifyJWT,
    authorizeRoles("admin"),
    getAllPendingVendors
)

router.route("/active").get(
    verifyJWT,
    authorizeRoles("admin"),
    getAllActiveVendors
)

router.route("/rejected").get(
    verifyJWT,
    authorizeRoles("admin"),
    getRejectedVendors
)

router.route("/verify").patch(
    verifyJWT,
    authorizeRoles("admin"),
    verifyVendorStatus
)

router.route("/delete/:vendorId").delete(
    verifyJWT,
    authorizeRoles("admin"),
    deleteExistingVendor
)

*/
router.route("/delete-user/:userId").delete(
    verifyJWT,
    authorizeRoles("vendor", "admin"),
    deleteUser
) //workin nicely
router.route("/get-all-users").get(
    verifyJWT,
    authorizeRoles("vendor", "admin"),
    getAllUsers
) //working nicely

router.route("/products/:productId").delete(
    verifyJWT,
    authorizeRoles("vendor", "admin"),
    deleteProductByAdmin
)

router.route("/products/:productId/status").patch(
    verifyJWT,
    authorizeRoles("vendor", "admin"),
    toggleProductStatusByAdmin
)
router.route("/update-details").patch(verifyJWT, authorizeRoles("vendor", "admin"), updateVendorDetails)
router.route("/update-bank-details").patch(verifyJWT, authorizeRoles("vendor", "admin"), updateBankDetails)
router.route("/update-logo").patch(verifyJWT, authorizeRoles("vendor", "admin"), upload.single("vendorLogo"), updateVendorlogo)

router.route("/profile").get(verifyJWT, authorizeRoles("vendor", "admin"), getVendorDetails) //working nicely
router.route("/analytics").get(verifyJWT, authorizeRoles("vendor", "admin"), getVendorAnalytics); //partially tested without products working
router.route("/sold-items").get(verifyJWT, authorizeRoles("vendor", "admin"), getVendorSoldProducts); //partially tested without products working
router.route("/notifications").get(verifyJWT, authorizeRoles("vendor", "admin"), getVendorNotifications);
router.route("/notifications/:notificationId/read").patch(verifyJWT, authorizeRoles("vendor", "admin"), markVendorNotificationRead);
router.route("/notifications/read-all").patch(verifyJWT, authorizeRoles("vendor", "admin"), markAllVendorNotificationsRead);
router.route("/reports/orders").get(verifyJWT, authorizeRoles("vendor", "admin"), downloadOrderReports);
router.route("/shipments").get(verifyJWT, authorizeRoles("vendor", "admin"), getAdminShipments);
router.route("/shipments/:orderId").patch(verifyJWT, authorizeRoles("admin"), updateAdminShipment);

router.route("/initial-setup-129986").post(upload.single("vendorLogo"), setupInitialAdminAndStore) //working nicely


export default router
