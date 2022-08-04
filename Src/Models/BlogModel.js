const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types


const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    post_img: {
        fileName: {
            type: String,
        },
        fileSize: {
            type: String,
        },
        public_id: {
            type: String,
            default: "tzsmxrevyes1xsuyujlk",
        },
        url: {
            type: String,
            default:
                "https://res.cloudinary.com/dm3gs2s0h/image/upload/v1650136405/userImage/tzsmxrevyes1xsuyujlk.png",
        },
    },
    cover_img: {
        fileName: {
            type: String,
        },
        fileSize: {
            type: String,
        },
        public_id: {
            type: String,
            default: "tzsmxrevyes1xsuyujlk",
        },
        url: {
            type: String,
            default:
                "https://res.cloudinary.com/dm3gs2s0h/image/upload/v1650136405/userImage/tzsmxrevyes1xsuyujlk.png",
        },
    },
    likes: [{ type: ObjectId, ref: "user" }],
    comments: [{
        text: String,
        postedBy: { type: ObjectId, ref: "user" }
    }],
    postedBy: {
        type: ObjectId,
        ref: "User"
    },
    verified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true })

let BlogModel = mongoose.model("blog", blogSchema)
export default BlogModel;