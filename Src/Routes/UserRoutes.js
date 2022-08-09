import express from "express";
let UserRoutes = express.Router();
import { UserController } from "../Controller";
import {
  AuthenticationMiddleware,
  Upload,
} from "../Middleware";

// [ + ]After Login this url is used for user
UserRoutes.get("/profile", AuthenticationMiddleware, UserController.userProfile);

UserRoutes.put("/changePassword", AuthenticationMiddleware, UserController.changePassword);

UserRoutes.post("/profile_image", AuthenticationMiddleware, Upload.single("profile_img"), UserController.uploadProfileImage);
UserRoutes.post("/background_file", AuthenticationMiddleware, Upload.single("background_img"), UserController.uploadBackgroundFile);
UserRoutes.get("/getprofile", AuthenticationMiddleware, UserController.getProfile);
UserRoutes.get("/search-user", AuthenticationMiddleware, UserController.search);

UserRoutes.put("/edit_profile/:id", AuthenticationMiddleware, Upload.single("profile_img"), UserController.editUserprofile);

UserRoutes.put("/deactivate", AuthenticationMiddleware, UserController.deactivateAccount);
UserRoutes.put("/follow", AuthenticationMiddleware, UserController.followFriend);
UserRoutes.put("/unfollow", AuthenticationMiddleware, UserController.unfollowFriend);

UserRoutes.get("/admin/user", AuthenticationMiddleware, UserController.getAllUserDetails);

UserRoutes.get("/admin/user/:id", AuthenticationMiddleware, UserController.getUserDetails);

export default UserRoutes;
