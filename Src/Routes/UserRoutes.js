import express from "express";
let UserRoutes = express.Router();
import { UserController } from "../Controller";
import {
  AuthenticationMiddleware,
  Upload,
} from "../Middleware";

// [ + ]After Login this url is used for user
UserRoutes.get("/profile", AuthenticationMiddleware, UserController.userProfile);
UserRoutes.get("/getprofile", AuthenticationMiddleware, UserController.getProfile);

UserRoutes.put("/changePassword", AuthenticationMiddleware, UserController.changePassword);

UserRoutes.post("/profile_image", AuthenticationMiddleware, Upload.single("profile_img"), UserController.uploadProfileImage);

UserRoutes.put("/edit_profile/:id", AuthenticationMiddleware, Upload.single("profile_img"), UserController.editUserprofile);

UserRoutes.put("/deactivate", AuthenticationMiddleware, UserController.deactivateAccount);

UserRoutes.get("/admin/user", AuthenticationMiddleware, UserController.getAllUserDetails);

UserRoutes.get("/admin/user/:id", AuthenticationMiddleware, UserController.getUserDetails);

export default UserRoutes;
