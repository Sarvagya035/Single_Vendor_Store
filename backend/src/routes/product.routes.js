import { Router } from "express";
import { 
    addVariant,
    createProductByAdmin,
    deleteProduct, 
    deleteVariant, 
    getAllProducts, 
    getLandingPageProducts, 
    getProductById, 
    adjustVariantStock,
    searchProductsDeep, 
    updateProductDetails, 
    updateVariantDiscount } from "../controllers/product.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {authorizeRoles} from "../middlewares/authorization.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Route to create a product
router.route("/add-product").post(
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
    createProductByAdmin
);

router.route("/add-variant/:productId").post(
    verifyJWT,
    authorizeRoles("admin"),
    upload.single("variantImage"),
    addVariant
)

router.route("/delete-product/:productId").delete(
    verifyJWT, 
    authorizeRoles("admin"),
    deleteProduct
);

router.route("/update-product/:productId").patch(
    verifyJWT,
    authorizeRoles("admin"), 
    updateProductDetails
);

router.route("/adjust-variant-stock/:productId/:variantId").patch(
    verifyJWT,
    authorizeRoles("admin"),
    adjustVariantStock
)

router.route("/delete-variant/:productId/:variantId").delete(
    verifyJWT,
    authorizeRoles("admin"),
    deleteVariant
)

router.route("/update-variant-discount/:productId/:variantId").patch(
    verifyJWT,
    authorizeRoles("admin"),
    updateVariantDiscount
)

router.route("/search").get(searchProductsDeep)
router.route("/get-landing-page-products").get(getLandingPageProducts)

router.route("/public/get-product-by-id/:productId").get(getProductById)
router.route("/get-all-products").get(getAllProducts)

export default router;
