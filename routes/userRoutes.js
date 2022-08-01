import express from "express";
let UserRoutes = express.Router();
import { UserController } from "../Controller";
import {
    AuthenticationMiddleware,
    Upload,
} from "../Middleware";

// [ + ]After Login this url is used for user
UserRoutes.get(
    "/profile",
    AuthenticationMiddleware,
    UserController.userProfile
);
UserRoutes.put(
    "/changePassword",
    AuthenticationMiddleware,
    UserController.changePassword
);
UserRoutes.post(
    "/profile_image",
    AuthenticationMiddleware,
    Upload.single("profile_img"),
    UserController.uploadProfileImage
);
UserRoutes.put(
    "/changePassword",
    AuthenticationMiddleware,
    UserController.changePassword
);

UserRoutes.put(
    "/edit_profile/:id",
    AuthenticationMiddleware,
    Upload.single("profile_img"),
    UserController.editUserprofile
);

export default UserRoutes;