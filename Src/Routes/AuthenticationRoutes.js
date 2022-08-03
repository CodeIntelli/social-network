import express from "express";
let AuthenticationRoutes = express.Router();
import { AuthController } from "../Controller/";

// [ + ] Auth Routes
AuthenticationRoutes.post("/register", AuthController.registerUser);

AuthenticationRoutes.post("/users/verify/:id", AuthController.verifyEmail);

AuthenticationRoutes.post("/login", AuthController.login);
AuthenticationRoutes.post("/signinwithGoogle", AuthController.login);

AuthenticationRoutes.post("/resendVerifyEmail/:id", AuthController.resendVerifyEmail);

AuthenticationRoutes.post("/password/forgot", AuthController.forgotPassword);

AuthenticationRoutes.put("/password/reset/:token", AuthController.resetPassword);

AuthenticationRoutes.get("/logout", AuthController.logout);

export default AuthenticationRoutes;
