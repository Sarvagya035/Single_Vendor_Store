import { Router } from "express"
import { 
    changeCurrentPassword, 
    getCurrentUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateUserAvatar, 
    updateUserDetails, 
    uploadAvatarImage } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

// routes for user 

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-user").patch(verifyJWT, updateUserDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single('avatar'), updateUserAvatar)
router.route("/changePassword").post(verifyJWT, changeCurrentPassword)
router.route("/updateAvatar").post(verifyJWT, upload.single('avatar'), uploadAvatarImage)
router.route("/refresh-token").post(refreshAccessToken)

    

export default router