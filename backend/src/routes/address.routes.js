import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addNewAddress, deleteExistingAddress, getAllAddress, setAddressAsDefault, updateExistingAddress } from "../controllers/address.controller.js";

const router = Router()

router.route("/add-address").post(verifyJWT,addNewAddress)
router.route("/get-address").get(verifyJWT,getAllAddress)
router.route("/update-address/:addressId").patch(verifyJWT,updateExistingAddress)
router.route("/delete-address/:addressId").delete(verifyJWT, deleteExistingAddress)
router.route("/set-defaultAddress/:addressId").post(verifyJWT,setAddressAsDefault)


export default router