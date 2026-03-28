import { Router } from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {getVendorDetails, registerVendor, updateBankDetails, updateVendorDetails, updateVendorlogo, getVendorAnalytics, getVendorSoldProducts} from "../controllers/vendor.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { authorizeRoles } from "../middlewares/authorization.middleware.js"

const router = Router()

router.route("/registerVendor").post(verifyJWT, upload.single("vendorLogo"), registerVendor)
router.route("/profile").get(verifyJWT, authorizeRoles("vendor"), getVendorDetails)
router.route("/update-details").patch(verifyJWT, authorizeRoles("vendor"), updateVendorDetails)
router.route("/update-logo").patch(verifyJWT, authorizeRoles("vendor"), upload.single("vendorLogo"), updateVendorlogo)
router.route("/update-bank-details").patch(verifyJWT, authorizeRoles("vendor"),updateBankDetails)
router.route("/analytics").get(verifyJWT, authorizeRoles("vendor", "admin"), getVendorAnalytics);
router.route("/sold-items").get(verifyJWT, authorizeRoles("vendor", "admin"), getVendorSoldProducts);


export default router