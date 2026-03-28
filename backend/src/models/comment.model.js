import mongoose, {Schema} from "mongoose"


const commentSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    commentBody : {
        type: String,
        required: true,
        trim: true
    },
    rating:{
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewImages: [
        {
            type: String,
        }
    ]

},
{timestamps: true})

commentSchema.index({user: 1, product: 1}, {unique: true});

export const Comment = mongoose.model("Comment", commentSchema)