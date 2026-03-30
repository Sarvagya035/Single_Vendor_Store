import { Router } from "express"
import { createCategory, deleteCategory, getAllCategoriesForLandingPage, getCategoryTree, getSubCategories, updateCategory } from "../controllers/category.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {authorizeRoles} from "../middlewares/authorization.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/create-category").post(
    verifyJWT,
    authorizeRoles("vendor"), 
    upload.single("image"), 
    createCategory
)

router.route("/update-category/:categoryId").patch(
    verifyJWT,
    authorizeRoles("vendor"),
    updateCategory
)

router.route("/delete-category/:categoryId").delete(
    verifyJWT,
    authorizeRoles("vendor"),
    deleteCategory
)

router.route("/tree").get(getCategoryTree)
router.route("/landing").get(getAllCategoriesForLandingPage)
router.route("/sub-category/:parentId").get(getSubCategories)

export default router