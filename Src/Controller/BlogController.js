import { BlogModel, UserModel } from "../Models/";
import Joi from "joi";
import { AWSUpload, ErrorHandler, SendEmail } from "../Utils";

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
            const sendVerifyMail = await SendEmail({
                email: user.email,
                subject: `Blog Created by ${user.name}`,
                templateName: "welcomeMail",
                context: {
                    username: blog.title,
                    message: "blog created"
                },
            });
            if (!sendVerifyMail) {
                return next(
                    ErrorHandler.serverError(
                        "Something Error Occurred Please Try After Some Time"
                    )
                );
            }
            res.status(201).json({
                status: "Success",
                code: 201,
                data: blog,
                message:
                    "An Email send to your account blog created successfully",
            });
            // SendToken(user, 201, res, "Account Created Successfully");
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },
}
export default BlogController;