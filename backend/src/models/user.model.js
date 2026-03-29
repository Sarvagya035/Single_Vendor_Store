import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        trim: true, 
        index: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
    },

    avatar: {
        type: String, // cloudinary url
    },

    phone: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        validate: {
            validator: function (value) {
                if (!value) return true;
                return String(value).replace(/\D/g, '').length >= 10;
            },
            message: "Phone number must be at least 10 digits"
        }
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },

    role: {
        type: [String],
        enum: ["customer", "admin"],
        default: ["customer"]
    },

    refreshToken: {
        type: String
    }

},
{
    timestamps: true
})

userSchema.pre('save', async function (){

    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        role: this.role
    }, 
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)}

export const User = mongoose.model("User", userSchema)
