import { BlogModel, UserModel } from "../Models/";
import Joi from "joi";
import { AWSUpload, CheckMongoID, ErrorHandler, SuccessHandler } from "../Utils";

const BlogController = {
    async addBlog(req, res, next) {
        try {
            const user = await UserModel.findById(req.user.id);
            if (!user) {
                return next(
                    new ErrorHandler(`User does not exist with Id: ${req.user.id}`, 404)
                );
            }

            const BlogValidation = Joi.object({
                title: Joi.string().trim().min(2).max(20).messages({
                    "string.base": `Blog Name should be a type of 'text'`,
                    "string.min": `Blog Name should have a minimum length of {3}`,
                }).required(),
                body: Joi.string().trim().messages({
                    "string.base": `Blog Data should be a type of 'text'`,
                }).required(),
                verified: Joi.boolean().default(false),
            });

            const { error } = BlogValidation.validate(req.body);
            if (error) {
                return next(error);
            }
            let { title, body } = req.body;

            // post_img
            const file = req.files['post_img'];
            const folderPost = "/post"
            const result = await AWSUpload.uploadFile(folderPost, file[0])
            const fileSize = await AWSUpload.fileSizeConversion(file[0].size)
            console.log(result)
            // cover_img
            const file1 = req.files['cover_img']
            const folderCover = "/Backgroundpost"
            const result1 = await AWSUpload.uploadFile(folderCover, file1[0])
            const fileSize1 = await AWSUpload.fileSizeConversion(file1[0].size)

            const blog = await BlogModel.create({
                title,
                body,
            });
            // post_img
            blog.post_img.fileName = file[0].originalname
            blog.post_img.fileSize = fileSize;
            blog.post_img.public_id = result.Key
            blog.post_img.url = result.Location

            // cover_img
            blog.cover_img.fileName = file1[0].originalname
            blog.cover_img.fileSize = fileSize1;
            blog.cover_img.public_id = result1.Key
            blog.cover_img.url = result1.Location
            blog.save();

            res.status(201).json({
                status: "Success",
                code: 201,
                data: blog,
                message:
                    "your blog created successfully",
            });
            // SendToken(user, 201, res, "Account Created Successfully");
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

    async deleteBlog(req, res) {
        try {
            const id = await CheckMongoID(req.params.id)
            if (!id) {
                return next(ErrorHandler.WrongObject("Wrong MongoDB Id"));
            }
            const blog = await BlogModel.findById(req.params.id);
            if (!blog) {
                return next(
                    new ErrorHandler(`User does not exist with Id: ${req.user.id}`, 404)
                );
            }
            await blog.remove();

            res.status(200).json({
                success: true,
                message: "Blog is Deleted Successfully",
            });
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

    async editBlog(req, res, next) {
        debugger
        try {
            const testId = CheckMongoID(req.params.id);
            if (!testId) {
                return next(ErrorHandler.WrongObject("Wrong MongoDB Id"));
            }

            const newBlogData = {
                title: req.body.title,
                body: req.body.body,
                like: req.body.like,
                comment: req.body.comment,
            };
            if (req.files.post_img !== undefined && req.files.post_img !== "") {
                const blog = await BlogModel.findById(req.params.id);
                const imageId = blog.post_img.public_id;
                await AWSUpload.removeObj(imageId);
                const folderPost = "/post"
                const file = req.files['post_img'];
                const result = await AWSUpload.uploadFile(folderPost, file[0])
                const fileSize = await AWSUpload.fileSizeConversion(file[0].size)
                blog.post_img.fileName = file[0].originalname;
                blog.post_img.fileSize = fileSize;
                blog.post_img.public_id = result.Key
                blog.post_img.url = result.Location
            }
            if (req.files.cover_img !== undefined && req.files.cover_img !== "") {
                const blog = await BlogModel.findById(req.params.id);
                const imageId = blog.cover_img.public_id;
                await AWSUpload.removeObj(imageId);
                const folderPost = "/Backgroundpost"
                const file = req.files['cover_img'];
                const result = await AWSUpload.uploadFile(folderPost, file[0])
                const fileSize = await AWSUpload.fileSizeConversion(file[0].size)
                blog.cover_img.fileName = file[0].originalname;
                blog.cover_img.fileSize = fileSize;
                blog.cover_img.public_id = result.Key
                blog.cover_img.url = result.Location
            }
            const blog = await BlogModel.findByIdAndUpdate(req.params.id, newBlogData, {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });

            res.status(200).json({
                success: true,
                blog,
            });

            next();
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

    async getAll(req, res, next) {
        try {
            const Blogs = await BlogModel.find(
                { __v: 0 },
                { __v: 0, createdAt: 0 }
            ).sort({ createdAt: -1 });
            SuccessHandler(200, Blogs, "Blog Details Display Successfully", res);
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

    async getSingle(req, res) {
        try {
            const Blog = await BlogModel.findById(req.params.id);
            SuccessHandler(200, Blog, "BLog Display Successfully", res);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async likeBlog(req, res, next) {
        try {
            const Blog = await BlogModel.findByIdAndUpdate(req.body.id,
                { $push: { likes: req.user._id } },
                {
                    new: true,
                    runValidators: true,
                    useFindAndModify: false,
                });
            res.status(200).json({
                success: true,
                Blog,
            });
        }
        catch (error) {
            return next(ErrorHandler.serverError(error));
        }

    },

    async unlikeBlog(req, res, next) {
        try {
            const Blog = await BlogModel.findByIdAndUpdate(req.body.id,
                { $pull: { likes: req.user._id } },
                {
                    new: true,
                    runValidators: true,
                    useFindAndModify: false,
                });
            res.status(200).json({
                success: true,
                Blog,
            });
        }
        catch (error) {
            return next(ErrorHandler.serverError(error));
        }

    }
}
export default BlogController;