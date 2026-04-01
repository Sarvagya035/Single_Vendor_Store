import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js"
import {User} from "../models/user.model.js"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import fs from "fs"

const options = {
    httpOnly: true
}

const generateAccessandRefreshToken = async function(userId){

    try {

        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while creating the tokens")
    }

}

const registerUser = asyncHandler(async (req, res) =>{
    // get userData from frontend
    // validate details - not empty
    // check if User already exist or not
    // check for images specifically avatar
    // upload image to cloudinary
    // create user object - create entry in database
    // remove password and response token field from response
    // check for user creation
    // return response

    const {username, password, email, phone} = req.body

    if(
        [username, password, email, phone].some((element) => !element || element?.trim() === "" )
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({email})

    if(existingUser){
        throw new ApiError(409, "User Already Exists")
    }

    const user = await User.create({
        username,
        email,
        phone,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Error creating the user")
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User created Successfully"))
})

const loginUser = asyncHandler(async (req, res) =>{

    // get user details from frontend
    // validate details -check if fields are not empty
    // check if user exists or not
    // if user exists compare the password
    // generate access and refresh token
    // save refresh token in database - included in previous step
    // send refresh token and access token as response cookies

    const {email, password} = req.body

    if(!email || !password){
        throw new ApiError(400, "Email and password are required")
    }

    const existingUser = await User.findOne({email})

    if(!existingUser){
        throw new ApiError(401, "Invalid email or password")
    }

    const isPasswordValid = await existingUser.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid email or password")
    }

    const {accessToken, refreshToken} = await generateAccessandRefreshToken(existingUser._id)
    const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged in successfully"
    ))
})

const logoutUser = asyncHandler(async (req, res) =>{
    
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $unset:{
                refreshToken: 1 //this removes this field completely
            }
        },
        {
            new: true
        }
    )

    return res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json(new ApiResponse(200, {}, "User Logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) =>{

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "User is Unauthorized")
    }

    try {

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh Token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const {accessToken, refreshToken} = await generateAccessandRefreshToken(user._id)

        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(
            200,
            {
                accessToken, 
                refreshToken
            },
            "Access token refreshed"
        ))
        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }
})

const getCurrentUser = asyncHandler(async (req, res)=>{
    
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateUserDetails = asyncHandler(async(req, res) =>{

    // get details from frontend
    // get user and update the user

    const {username, phone} = req.body

    const updatedUser = {}
    if(username) updatedUser.username = username
    if(phone) updatedUser.phone = phone

    if(Object.keys(updatedUser).length == 0){
        throw new ApiError(400, "At least one field is required to update")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: updatedUser
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(
        200,
        user,
        "Account details updated successfully"
    ))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const changeCurrentPassword = asyncHandler(async (req, res) =>{

    const {oldPassword, newPassword} = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required")
    }

    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, "The current password you entered is incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{}, "Password Changed Successfully"))
})

const uploadAvatarImage = asyncHandler(async (req, res) =>{

    const userId = req.user?._id
    if(!userId){
        throw new ApiError(403, "Unauthorized User")
    }

    console.log(req.file)

    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(404, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(400, "Error uploading avatar image")
    }

    try {
        const UpdatedUser = await User.findByIdAndUpdate(
            userId, 
            {
                $set: {
                    avatar: avatar.url
                }
            },
            {
                new: true
            }
        ).select("-password -refreshToken")
    
        return res.status(200).json(new ApiResponse(
            200, 
            UpdatedUser, 
            "Avatar Updated successfully"
        ))
    } catch (error) {
        if (fs.existsSync(avatarLocalPath)) fs.unlinkSync(avatarLocalPath);
        throw new ApiError(500, error?.message || "Internal server error");
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    changeCurrentPassword,
    uploadAvatarImage
}
