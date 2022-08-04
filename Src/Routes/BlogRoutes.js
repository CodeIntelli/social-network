import express from 'express';
const BlogRoutes = express.Router();
import { AuthenticationMiddleware, Upload } from "../Middleware";
import { BlogController } from "../Controller";

BlogRoutes.post("/blog", AuthenticationMiddleware, Upload.fields([{ name: 'post_img', maxCount: 1 }, { name: 'cover_img', maxCount: 1 }]), BlogController.addBlog)

export default BlogRoutes;