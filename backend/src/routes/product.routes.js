import { Router } from "express";
import { 
    addVariant, 
    createProduct, 
    deleteProduct, 
    deleteVariant, 
    getAllProducts, 
    getLandingPageProducts, 
    getProductById, 
    getVendorProducts, 
    restockVariant, 
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
    authorizeRoles("vendor"),
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
    createProduct
);

router.route("/add-variant/:productId").post(
    verifyJWT,
    authorizeRoles("vendor"),
    upload.single("variantImage"),
    addVariant
)

router.route("/my-products").get(
    verifyJWT, 
    authorizeRoles("vendor"), 
    getVendorProducts
);

router.route("/delete-product/:productId").delete(
    verifyJWT, 
    authorizeRoles("vendor"), 
    deleteProduct
);

router.route("/update-product/:productId").patch(
    verifyJWT,
    authorizeRoles("vendor"), 
    updateProductDetails
);

router.route("/restock-variant/:productId/:variantId").patch(
    verifyJWT,
    authorizeRoles("vendor"),
    restockVariant
)

router.route("/delete-variant/:productId/:variantId").delete(
    verifyJWT,
    authorizeRoles("vendor"),
    deleteVariant
)

router.route("/update-variant-discount/:productId/:variantId").patch(
    verifyJWT,
    authorizeRoles("vendor"),
    updateVariantDiscount
)

router.route("/search").get(searchProductsDeep)
router.route("/get-landing-page-products").get(getLandingPageProducts)

router.route("/public/get-product-by-id/:productId").get(getProductById)
router.route("/get-product-by-id/:productId").get(getProductById)
router.route("/get-all-products").get(getAllProducts)

export default router;