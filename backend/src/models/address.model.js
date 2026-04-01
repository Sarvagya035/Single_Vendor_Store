import mongoose, {Schema} from "mongoose"

const addressSchema = new Schema({

    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        required: true,
        validate: {
            validator: function (value) {
                return /^\d{10,}$/.test(String(value || ""));
            },
            message: "Phone number must be numeric and at least 10 digits"
        }
    },
    addressLine1: {
        type: String,
        required: true,
        trim: true,
    },
    addressLine2: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
        required: true
    },
    state: {
        type: String,
        trim: true,
        required: true,
    },
    postalCode: {
        type: String,
        trim: true,
        required: true,
        validate: {
            validator: function (value) {
                return /^\d{4,10}$/.test(String(value || ""));
            },
            message: "Postal code must be numeric"
        }
    },
    country: {
        type: String,
        trim: true,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    }
},{
    timestamps: true
})

addressSchema.pre("save", async function(){

    if(this.isModified("isDefault") && this.isDefault === true){
        try {
            
            await mongoose.model("Address").updateMany({
                user: this.user,
                _id: {
                    $ne: this._id
                }
            },
            {
                $set:{
                    isDefault: false
                }
            }
        )
        } catch (error) {
            console.error(error)
            return;
        }
    }
});

export const Address = mongoose.model("Address", addressSchema)
