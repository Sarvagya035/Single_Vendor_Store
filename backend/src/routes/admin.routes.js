import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteExistingVendor, getAllActiveVendors, getAllPendingVendors, getRejectedVendors, verifyVendorStatus } from "../controllers/vendor.controller.js";
import { 
    createProductForVendor, 
    deleteProductByAdmin, 
    deleteUser, 
    deleteVendorAndProducts, 
    getAllUsers, 
    toggleProductStatusByAdmin 
} from "../controllers/admin.Controllers.js";

const router = Router()

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

router.route("/delete-user/:userId").delete(
    verifyJWT,
    authorizeRoles("admin"),
    deleteUser
)
router.route("/delete-vendor/:vendorId").delete(
    verifyJWT,
    authorizeRoles("admin"),
    deleteVendorAndProducts
)
router.route("/get-all-users").get(
    verifyJWT,
    authorizeRoles("admin"),
    getAllUsers
)

router.route("/products").post(
    verifyJWT,
    authorizeRoles("admin"),
    upload.fields([
        {
            name: "mainImages",
            maxCount: 5
        },
        {
            name: "variantImages",
            maxCount: 10
        }
    ]),
    createProductForVendor
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


export default router
