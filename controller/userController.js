import { UserModel, TokenModel } from "../Models";
import {
    AWSUpload,
    Cloudinary,
    ErrorHandler,
    SendEmail,
    SendTextMessage,
    Security,
    SendToken,
    SuccessHandler,
    CheckMongoID,
    GenerateOTP,
} from "../Services";
import Joi from "joi";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { FRONTEND_URL } from "../../Config";

const UserController = {
  
    // [ + ] Upload Profile Picture
    async uploadProfileImage(req, res, next) {
        try {
            const user = await UserModel.findById(req.user.id);
            req.file.path = req.file.path.replace("\\", "/");
            let myCloud = await Cloudinary.UploadFile(
                req.file.path,
                `${user.id}/profile`
            );
            let fileSize = await Cloudinary.fileSizeConversion(req.file.size);
            user.profile_img.fileName = req.file.filename;
            user.profile_img.fileSize = fileSize;
            user.profile_img.public_id = myCloud.public_id;
            user.profile_img.url = myCloud.url;
            user.save();
            SuccessHandler(200, user, "User Profile Uploaded Successfully", res);
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

    // [ + ] GET USER DETAILS
    async userProfile(req, res, next) {
        try {
            const user = await UserModel.findById(req.user.id);
            if (user.status == "Deactivate") {
                next(
                    ErrorHandler.unAuthorized(
                        "It Seem's You have deleted Your Account Please Check Your Mail For More Details"
                    )
                );
                return SuccessHandler(200, "", "User Account Deactivate", res);
            }
            SuccessHandler(200, user, "User Details Display Successfully", res);
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

    // [ + ] GET ALL USER DETAIL LOGIC
    async getAllUserDetails(req, res, next) {
        try {
            const users = await UserModel.find(
                { __v: 0 },
                { __v: 0, createdAt: 0 }
            ).sort({ createdAt: -1 });
            SuccessHandler(200, users, "User Details Display Successfully", res);
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

    // [ + ] UPDATE USER PASSWORD

    async changePassword(req, res, next) {
        try {
            const UserValidation = Joi.object({
                oldPassword: Joi.string().required().messages({
                    "string.base": `User Name should be a type of 'text'`,
                    "string.empty": `User Name cannot be an empty field`,
                    "string.min": `User Name should have a minimum length of {3}`,
                    "any.required": `User Name is a required field`,
                }),
                newPassword: Joi.string()
                    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
                    .required(),
                confirmPassword: Joi.ref("password"),
            });
            const { error } = UserValidation.validate(req.body);
            if (error) {
                return next(error);
            }

            if (req.body.newPassword || req.body.confirmPassword) {
                if (req.body.newPassword !== req.body.confirmPassword) {
                    return next(
                        ErrorHandler.unAuthorized(
                            "Confirm Password & Password Must Be Same"
                        )
                    );
                }
            }
            const user = await UserModel.findById(req.user.id).select("+password");
            let oldPasswordTest = await bcrypt.compare(
                req.body.newPassword,
                user.password
            );
            if (!oldPasswordTest) {
                return next(ErrorHandler.notFound("Old Password Is Incorrect"));
            }
            // if (req.body.newPassword) {
            //   let newPassword = req.body.newPassword;
            //   newPassword = await bcrypt.hash(newPassword, 10);
            //   let samePassword = await bcrypt.compare(newPassword, user.password);
            //   if (samePassword) {
            //     return next(
            //       ErrorHandler.alreadyExist(
            //         "You Can't use old password, please enter new password"
            //       )
            //     );
            //   }
            // }

            user.password = req.body.newPassword;
            user.save();
            SendToken(user, 200, res);
            SuccessHandler(200, user, "Password Change Successfully", res);
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

    // [ + ] GET SINGLE USER LOGIC

    async getSingleUser(req, res, next) {
        try {
            const testId = CheckMongoID(req.params.id);
            if (!testId) {
                return next(ErrorHandler.wrongCredentials("Wrong MongoDB Id"));
            }
            const user = await UserModel.findById(req.params.id);

            if (!user) {
                return next(
                    ErrorHandler.notFound(`User does not exist with Id: ${req.params.id}`)
                );
            }

            res.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

    // [ + ] UPDATE USER DETAIL LOGIC

    async editUserprofile(req, res, next) {
        try {
            const testId = CheckMongoID(req.params.id);
            if (!testId) {
                return next(ErrorHandler.wrongCredentials("Wrong MongoDB Id"));
            }
            const UserValidation = Joi.object({
                name: Joi.string().trim().min(3).max(30).messages({
                    "string.base": `User Name should be a type of 'text'`,
                    "string.min": `User Name should have a minimum length of {3}`,
                }),
                email: Joi.string().email().trim().messages({
                    "string.base": `User Email should be a type of 'text'`,
                }),
                profile_img: Joi.string(),
            });
            const { error } = UserValidation.validate(req.body);
            if (error) {
                return next(error);
            }
            if (req.body.email) {
                const userEmailCheck = await UserModel.exists({
                    email: req.body.email,
                });
                if (userEmailCheck) {
                    return next(ErrorHandler.unAuthorized("This email is already taken"));
                }
            }
            const newUserData = {
                name: req.body.name,
                email: req.body.email,
            };
            if (req.body.profile_img !== undefined && req.body.profile_img !== "") {
                const user = await UserModel.findById(req.user.id);
                const imageId = user.profile_img.public_id;
                await Cloudinary.RemoveFile(imageId);
                const myCloud = await Cloudinary.UploadFile(
                    req.file.path,
                    `${user.id}/profile`
                );

                newUserData.profile_img = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }
            const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });

            res.status(200).json({
                success: true,
                user,
            });

            next();
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

    // [ + ] DELETE USER LOGIC

    async deactivateAccount(req, res, next) {
        try {
            const user = await UserModel.findById(req.user.id);

            if (!user) {
                return next(
                    ErrorHandler.notFound(`User does not exist with Id: ${req.user.id}`)
                );
            }

            let userStatus = user.status;

            let DeactivatedUser = {
                status: "Deactivate",
            };

            let updatedUser = await UserModel.findByIdAndUpdate(
                req.params.id,
                DeactivatedUser,
                {
                    new: true,
                    runValidators: true,
                    useFindAndModify: false,
                }
            );

            let message = `We are so sorry mail here after user delete account permenantly`;
            const afterDeleteMail = await SendEmail({
                email: user.email,
                subject: `Delete Account Permenantly`,
                message,
            });
            if (!afterDeleteMail) {
                return next(
                    ErrorHandler.serverError(
                        "Something Error Occurred Please Try After Some Time"
                    )
                );
            }
            res.status(200).json({
                success: true,
                updatedUser,
                message: "User Account Removed Successfully",
            });
        } catch (error) {
            return next(ErrorHandler.serverError(error));
        }
    },

};

export default UserController;