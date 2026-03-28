import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinaryUpload.js"
import { Vendor } from "../models/vendor.model.js"
import { User } from "../models/user.model.js"
import { Order } from "../models/order.model.js";

const registerVendor = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const existingApplication = await Vendor.findOne({ user: userId });
    if (existingApplication && existingApplication.verificationStatus !== "rejected") {
        throw new ApiError(400, "You have an active or approved vendor registration");
    }

    // 2. Destructure fields including bankDetails from req.body
    // Frontend should send bankDetails as an object or flat fields
    const { 
        shopName, 
        vendorAddress, 
        vendorDescription, 
        gstNumber,
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        upiId 
    } = req.body;

    // 3. Validation for all required fields
    if (
        [shopName, vendorAddress, vendorDescription, gstNumber, accountHolderName, accountNumber, ifscCode, bankName]
        .some(field => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All details including primary bank details are required");
    }

    // 4. Check for unique GST
    const existingGst = await Vendor.findOne({ gstNumber: gstNumber.toUpperCase() });
    if (existingGst) {
        throw new ApiError(409, "Vendor with this GST already exists");
    }

    // 5. Handle Logo Upload
    const logoImageLocalPath = req.file?.path;
    if (!logoImageLocalPath) {
        throw new ApiError(404, "Logo Image is required");
    }

    const logoImage = await uploadOnCloudinary(logoImageLocalPath);
    if (!logoImage) {
        throw new ApiError(400, "Error uploading Logo Image");
    }

    // 6. Create Vendor with Bank Details
    const newVendor = await Vendor.create({
        shopName,
        vendorAddress,
        vendorDescription,
        vendorLogo: logoImage?.url,
        user: userId,
        gstNumber: gstNumber.toUpperCase(),
        // Mapping flat fields to the nested bankDetails object in the model
        bankDetails: {
            accountHolderName,
            accountNumber,
            ifscCode,
            bankName,
            upiId: upiId || "" // UPI is optional in our model
        }
    });

    if (!newVendor) {
        throw new ApiError(500, "Something went wrong while creating vendor profile");
    }

    return res.status(201).json(
        new ApiResponse(201, newVendor, "Vendor registration submitted successfully")
    );
});

const getVendorDetails = asyncHandler(async (req, res)=>{

    const userId = req.user?._id
    
    if(!userId){
        throw new ApiError(401, "User Unauthorized")
    }

    const vendor = await Vendor.findOne({user: userId});

    if(!vendor){
        throw new ApiError(404, "Vendor not found")
    }

    return res.status(200).json(new ApiResponse(
        200,
        vendor,
        "Vendor details fetched successfully"
    ))

})

const updateVendorDetails = asyncHandler(async (req, res)=>{

    const userId = req.user?._id
    if(!userId){
        throw new ApiError(401, "Unauthorized Request")
    }

    const vendor = await Vendor.findOne({user: userId})

    if(!vendor){
        throw new ApiError(404, "Vendor not found")
    }

    const fieldsToUpdate = ["vendorAddress", "vendorDescription"]

    fieldsToUpdate.forEach((field)=>{
        if(req.body[field] !== undefined){
            vendor[field] = req.body[field]
        }
    })

    await vendor.save()
    return res.status(200).json(new ApiResponse(200, vendor, "vendor details updated successfully"))
})

const updateVendorlogo = asyncHandler(async (req, res)=>{

    const userId = req.user?._id
    if(!userId){
        throw new ApiError(401, "Unauthorized request")
    }

    const vendor = await Vendor.findOne({user: userId})

    if(!vendor){
        throw new ApiError(400, "Vendor not found")
    }

    const vendorLogoPath = req.file?.path

    if(!vendorLogoPath){
        throw new ApiError(400, "Avatar file is missing")
    }
    
    const vendorLogo = await uploadOnCloudinary(vendorLogoPath)

    if(!vendorLogo.url){
        throw new ApiError(500, "Error uploading image to cloudinary")
    }
    
    vendor.vendorLogo = vendorLogo.url
    await vendor.save()

    return res.status(200).json(new ApiResponse(
        200,
        vendor,
        "Vendor logo updated successfully" 
    ))
})

const updateBankDetails = asyncHandler(async (req, res) => {
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;

    if (
        [accountHolderName, accountNumber, ifscCode, bankName].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All primary bank fields are required");
    }

    const vendor = await Vendor.findOne({ user: req.user?._id });

    if (!vendor) {
        throw new ApiError(404, "Vendor profile not found");
    }

    vendor.bankDetails = {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        upiId
    };

    // 4. Reset verification status logic is if bank changes we have to reverify....
    vendor.verificationStatus = "pending";
    vendor.isVerified = false;

    await vendor.save();

    return res.status(200).json(
        new ApiResponse(200, vendor, "Bank details updated. Profile sent for re-verification.")
    );
});


// all venodor functions accessible by admin only. 

const verifyVendorStatus = asyncHandler(async (req, res)=>{

    const {vendorId, action, remarks} = req.body
    
    if (!vendorId) {
        throw new ApiError(400, "Vendor ID is required");
    }

    if (!["approved", "rejected"].includes(action)) {
        throw new ApiError(400, "Invalid action. Use 'approved' or 'rejected'");
    }

    if (action === "rejected" && (!remarks || remarks.trim() === "")) {
        throw new ApiError(400, "Please provide a reason for rejection in remarks");
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        throw new ApiError(404, "Vendor profile not found");
    }

    if (action === "approved") {
        vendor.verificationStatus = "approved";
        vendor.isVerified = true;
        vendor.adminRemarks = "Verification Successful";

        const updatedUser = await User.findByIdAndUpdate(
            vendor.user, //getting user id from vendor model 
            {
                $addToSet: { role: "vendor" }
            },
            {
                new: true
        })

        if(!updatedUser){
            throw new ApiError(400, "Error updating user to vendor")
        }

    } else {
        vendor.verificationStatus = "rejected";
        vendor.isVerified = false;
        vendor.adminRemarks = remarks; 

        await User.findByIdAndUpdate(
            vendor.user,
            { $pull: { role: "vendor" } }
        )
    }

    await vendor.save();

    return res.status(200).json(
        new ApiResponse(
            200, 
            vendor, 
            `Vendor has been ${action} successfully`
        )
    );

})

const getAllPendingVendors = asyncHandler(async(req, res)=>{
    const pendingVendors = await Vendor.find({verificationStatus: "pending"});

    return res.status(200).json(new ApiResponse(
        200, 
        pendingVendors,
        "Vendors with status pending fetched successfully"
    ))
})

const getAllActiveVendors = asyncHandler(async(req, res)=>{
    const activeVendors = await Vendor.find({verificationStatus: "approved"});

    return res.status(200).json(new ApiResponse(
        200,
        activeVendors,
        "Active Vendors fetched Successfully"
    ))
})

const getRejectedVendors = asyncHandler(async (req, res)=>{
    const  rejectedVendors = await Vendor.find({verificationStatus: "rejected"});

    return res.status(200).json(new ApiResponse(
        200,
        rejectedVendors,
       "Rejected Vendors fetched successfully"
    ))

})

const deleteExistingVendor = asyncHandler(async(req, res)=>{

    const { vendorId } = req.params;
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        throw new ApiError(404, "Vendor profile not found");
    }

    await User.findByIdAndUpdate(
        vendor.user,
        { $pull: { role: "vendor" } }
    );

    await Vendor.findByIdAndDelete(vendorId);

    // if a vendor is deleted here its products will be deleted too this logic still has to be implemented

    return res.status(200).json(new ApiResponse(
        200,
        {},
        "Vendor profile and permissions removed successfully"
    ));
})

const getVendorAnalytics = asyncHandler(async (req, res) => {
    // 1. Find Vendor Profile
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) throw new ApiError(404, "Vendor profile not found");

    const analytics = await Order.aggregate([
        // Stage 1: Filter orders that have at least one item from this vendor
        {
            $match: {
                "orderItems.vendor": vendor._id,
                "paymentInfo.status": "Paid" // Sirf paid orders ka revenue ginte hain
            }
        },
        // Stage 2: Unwind the orderItems array to process each item individually
        {
            $unwind: "$orderItems"
        },
        // Stage 3: Filter again to keep ONLY this vendor's items
        {
            $match: {
                "orderItems.vendor": vendor._id
            }
        },
        // Stage 4: Group and Calculate
        {
            $group: {
                _id: null,
                totalRevenue: { 
                    $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } 
                },
                totalItemsSold: { $sum: "$orderItems.quantity" },
                totalOrders: { $addToSet: "$_id" } // Unique orders count
            }
        },
        {
            $project: {
                _id: 0,
                totalRevenue: 1,
                totalItemsSold: 1,
                totalOrdersCount: { $size: "$totalOrders" }
            }
        }
    ]);

    // 2. Get Product-wise sales listing
    const productSales = await Order.aggregate([
        { $match: { "orderItems.vendor": vendor._id, "paymentInfo.status": "Paid" } },
        { $unwind: "$orderItems" },
        { $match: { "orderItems.vendor": vendor._id } },
        {
            $group: {
                _id: "$orderItems.product",
                productName: { $first: "$orderItems.name" },
                quantitySold: { $sum: "$orderItems.quantity" },
                revenueGenerated: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
            }
        },
        { $sort: { quantitySold: -1 } } // Top selling products first
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            summary: analytics[0] || { totalRevenue: 0, totalItemsSold: 0, totalOrdersCount: 0 },
            productWiseSales: productSales
        }, "Vendor analytics fetched successfully")
    );
});

const getVendorSoldProducts = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) throw new ApiError(404, "Vendor profile not found");

    const soldProducts = await Order.find({
        "orderItems.vendor": vendor._id,
        "paymentInfo.status": "Paid"
    })
    .select("orderItems createdAt orderStatus")
    .sort("-createdAt");

    // Filter items to only show this vendor's items from each order
    const filteredList = soldProducts.map(order => {
        const myItems = order.orderItems.filter(
            item => item.vendor.toString() === vendor._id.toString()
        );
        return {
            orderId: order._id,
            date: order.createdAt,
            items: myItems,
            orderStatus: order.orderStatus
        };
    });

    return res.status(200).json(
        new ApiResponse(200, filteredList, "Sold products list fetched")
    );
});

export {
    registerVendor,
    getVendorDetails,
    updateVendorDetails,
    updateVendorlogo,
    verifyVendorStatus,
    getAllPendingVendors,
    getAllActiveVendors,
    getRejectedVendors,
    deleteExistingVendor,
    updateBankDetails,
    getVendorAnalytics,
    getVendorSoldProducts

}
