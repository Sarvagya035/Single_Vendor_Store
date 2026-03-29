import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import {
    getVendorDetails, 
    updateVendorDetails, 
    getVendorAnalytics, 
    getVendorSoldProducts 
} from "../controllers/vendor.controller.js"
import {  
    deleteProductByAdmin, 
    deleteUser, 
    getAllUsers, 
    toggleProductStatusByAdmin 
} from "../controllers/admin.Controllers.js";

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
    authorizeRoles("admin"),
    deleteUser
)
router.route("/get-all-users").get(
    verifyJWT,
    authorizeRoles("admin"),
    getAllUsers
)

router.route("/products/:productId").delete(
    verifyJWT,
    authorizeRoles("admin"),
    deleteProductByAdmin
)

router.route("/products/:productId/status").patch(
    verifyJWT,
    authorizeRoles("admin"),
    toggleProductStatusByAdmin
)

router.route("/profile").get(verifyJWT, authorizeRoles("admin"), getVendorDetails)
router.route("/update-details").patch(verifyJWT, authorizeRoles("admin"), updateVendorDetails)
router.route("/analytics").get(verifyJWT, authorizeRoles("admin"), getVendorAnalytics);
router.route("/sold-items").get(verifyJWT, authorizeRoles("admin"), getVendorSoldProducts);


export default router
