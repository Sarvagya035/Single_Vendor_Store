import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import {
    getVendorDetails,  
    getVendorAnalytics, 
    getVendorSoldProducts, 
    setupInitialAdminAndStore,
    updateBankDetails,
    updateVendorDetails,
    updateVendorlogo
} from "../controllers/vendor.controller.js"
import {  
    deleteProductByAdmin, 
    deleteUser, 
    getAllUsers, 
    toggleProductStatusByAdmin 
} from "../controllers/admin.Controllers.js";
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
    authorizeRoles("vendor"),
    deleteUser
) //workin nicely
router.route("/get-all-users").get(
    verifyJWT,
    authorizeRoles("vendor"),
    getAllUsers
) //working nicely

router.route("/products/:productId").delete(
    verifyJWT,
    authorizeRoles("vendor"),
    deleteProductByAdmin
)

router.route("/products/:productId/status").patch(
    verifyJWT,
    authorizeRoles("vendor"),
    toggleProductStatusByAdmin
)
router.route("/update-details").patch(verifyJWT, authorizeRoles("vendor"), updateVendorDetails)
router.route("/update-bank-details").patch(verifyJWT, authorizeRoles("vendor"), updateBankDetails)
router.route("/update-logo").patch(verifyJWT, authorizeRoles("vendor"), upload.single("vendorLogo"), updateVendorlogo)

router.route("/profile").get(verifyJWT, authorizeRoles("vendor"), getVendorDetails) //working nicely
router.route("/analytics").get(verifyJWT, authorizeRoles("vendor"), getVendorAnalytics); //partially tested without products working
router.route("/sold-items").get(verifyJWT, authorizeRoles("vendor"), getVendorSoldProducts); //partially tested without products working

router.route("/initial-setup-129986").post(upload.single("vendorLogo"), setupInitialAdminAndStore) //working nicely


export default router
