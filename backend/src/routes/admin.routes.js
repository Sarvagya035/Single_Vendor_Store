import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { 
    deleteProductByAdmin, 
    deleteUser, 
    getAllUsers, 
    toggleProductStatusByAdmin 
} from "../controllers/admin.Controllers.js";

const router = Router()

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


export default router
