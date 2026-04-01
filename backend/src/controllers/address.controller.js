import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Address } from "../models/address.model.js"
import {User} from "../models/user.model.js"

const addNewAddress = asyncHandler(async (req, res) =>{
    
    const userId = req.user?._id
    if(!userId){
        throw new ApiError(403, "Unauthorized request")
    }

    const {fullname, phone, addressLine1, addressLine2, city, state, postalCode, country} = req.body
    const normalizedPhone = normalizeDigits(phone);
    const normalizedPostalCode = normalizeDigits(postalCode);

    if (
        [fullname, phone, addressLine1, city, state, postalCode, country].some((field)=> !field || field.trim() === "")
    ){
        throw new ApiError(400, "Please Fill out all the fields")
    }

    if (normalizedPhone.length < 10) {
        throw new ApiError(400, "Phone number must be numeric and at least 10 digits");
    }

    if (normalizedPostalCode.length < 4) {
        throw new ApiError(400, "Postal code must be numeric");
    }

    const newAddress = await Address.create({
        fullname,
        phone: normalizedPhone,
        addressLine1,
        addressLine2: addressLine2 || "",
        city, 
        state,
        postalCode: normalizedPostalCode,
        country,
        isDefault: true,
        user: userId,
    })

    if(!newAddress){
        throw new ApiError(500, "Error creating the address")
    }

    return res.status(201).json(new ApiResponse(201, newAddress ,"Address added successfully"))
})

const getAllAddress = asyncHandler(async (req, res)=>{

    const addresses = await Address.find({user: req.user?._id}).sort({isDefault: -1, createdAt: -1})

    return res.status(200).json(new ApiResponse(200, addresses, "Addresses fetched successfully"))
})

const updateExistingAddress = asyncHandler(async (req, res)=>{

    const {addressId} = req.params
    const userId = req.user?._id

    const existingAddress = await Address.findOne({_id: addressId, user: userId})

    if(!existingAddress){
        throw new ApiError(404, "Address not found or unauthorized")
    }
    
    const fieldsToUpdate = ["fullname", "phone", "addressLine1", "addressLine2", "city", "state", "postalCode", "country", "isDefault"]

    fieldsToUpdate.forEach((field)=>{
        if(req.body[field] !== undefined){
            existingAddress[field] = req.body[field]
        }
    });

    if (typeof existingAddress.phone === "string") {
        existingAddress.phone = normalizeDigits(existingAddress.phone);
        if (existingAddress.phone.length > 0 && existingAddress.phone.length < 10) {
            throw new ApiError(400, "Phone number must be numeric and at least 10 digits");
        }
    }

    if (typeof existingAddress.postalCode === "string") {
        existingAddress.postalCode = normalizeDigits(existingAddress.postalCode);
        if (existingAddress.postalCode.length > 0 && existingAddress.postalCode.length < 4) {
            throw new ApiError(400, "Postal code must be numeric");
        }
    }

    await existingAddress.save();

    return res.status(200).json(new ApiResponse(200, existingAddress, "Address updated successfully"))
})

const deleteExistingAddress = asyncHandler(async (req, res) =>{
    
    const {addressId} = req.params
    const userId = req.user?._id 

    const deletedAddress = await Address.findByIdAndDelete({
        _id: addressId,
        user: userId
    })

    if(!deletedAddress){
        throw new ApiError(404, "Address not found")
    }

    if(deletedAddress.isDefault === true){
        const nextAddress = await Address.findOne({user: userId}).sort({createdAt: -1})

        if(nextAddress){
            nextAddress.isDefault = true
            await nextAddress.save()
        }
    }

    return res.status(200).json(new ApiResponse(200, {}, "Address deleted Successfully"))
})

const setAddressAsDefault = asyncHandler(async (req, res)=>{

    const {addressId} = req.params
    const userId = req.user?._id

    const address = await Address.findOne({ _id: addressId ,user: userId})

    if(!address){
        throw new ApiError(404, "Address not found")
    }

    if(address.isDefault === true){
        throw new ApiError(409, "Current address is already default")
    }

    address.isDefault = true
    await address.save()

    return res.status(200).json(
        new ApiResponse(200, address, "Default address updated")
    );
})


export { 
    
    addNewAddress,
    getAllAddress,
    updateExistingAddress, 
    deleteExistingAddress,
    setAddressAsDefault
    
}

function normalizeDigits(value) {
    return String(value || "").replace(/\D/g, "");
}
