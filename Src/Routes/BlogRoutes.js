import express from 'express';
const BlogRoutes = express.Router();
import { AuthenticationMiddleware, Upload } from "../Middleware";
import { BlogController } from "../Controller";

BlogRoutes.post("/create", AuthenticationMiddleware, Upload.fields([{ name: 'post_img', maxCount: 1 }, { name: 'cover_img', maxCount: 1 }]), BlogController.addBlog)
BlogRoutes.delete("/delete/:id", AuthenticationMiddleware, BlogController.deleteBlog)
BlogRoutes.put("/edit/:id", AuthenticationMiddleware, Upload.fields([{ name: 'post_img', maxCount: 1 }, { name: 'cover_img', maxCount: 1 }]), BlogController.editBlog)
BlogRoutes.get("/get/", AuthenticationMiddleware, BlogController.getAll)
BlogRoutes.get("/getBlog/:id", AuthenticationMiddleware, BlogController.getSingle)

export default BlogRoutes;