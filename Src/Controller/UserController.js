import { UserModel } from "../Models";
import Joi from "joi";
import {
  AWSUpload,
  ErrorHandler,
  SendEmail,
  SendToken,
  SuccessHandler,
  CheckMongoID,
} from "../Utils/";
import bcrypt from "bcryptjs";

const UserController = {

  // [ + ] Upload Profile Picture
  async uploadProfileImage(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return next(
          new ErrorHandler(`User does not exist with Id: ${req.body.id}`, 404)
        );
      }
      const file = req.file;
      const result = await AWSUpload.uploadFile(file)
      const fileSize = await AWSUpload.fileSizeConversion(file.size)
      console.log(file.size)
      user.profile.fileName = file.originalname
      user.profile.fileSize = fileSize;
      user.profile.public_id = result.key
      user.profile.url = result.Location
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
      if (req.body.newPassword) {
        let newPassword = req.body.newPassword;
        newPassword = await bcrypt.hash(newPassword, 10);
        let samePassword = await bcrypt.compare(newPassword, user.password);
        if (samePassword) {
          return next(
            ErrorHandler.alreadyExist(
              "You Can't use old password, please enter new password"
            )
          );
        }
      }

      user.password = req.body.newPassword;
      user.save();
      SendToken(user, 200, res);
      SuccessHandler(200, user, "Password Change Successfully", res);
    } catch (error) {
      return next(ErrorHandler.serverError(error));
    }
  },

  // [ + ] GET USER DETAILS
  async getUserDetails(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      // @ts-ignore
      if (user.status == "Deactivate") {
        next(
          new ErrorHandler(
            "It Seem's You have deleted Your Account Please Check Your Mail For More Details",
            422
          )
        );
        return SuccessHandler(200, "", "User Account Deactivate", res);
      }
      SuccessHandler(200, user, "User Details Display Successfully", res);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
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
        await AWSUpload.removeObj(imageId);
        const file = req.file;
        const result = await AWSUpload.uploadFile(file)
        const fileSize = await AWSUpload.fileSizeConversion(file.size)
        console.log(file.size)
        newUserData.profile_img.fileName = file.originalname
        newUserData.profile_img.fileSize = fileSize;
        newUserData.profile_img.public_id = result.key
        newUserData.profile_img.url = result.Location
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


  // [ + ] getsigned url
  async getProfile(req, res, next) {
    try {
      const key = req.params.id;
      if (!key) {
        new ErrorHandler("please provide valid key", 402)
      }
      const result = await AWSUpload.getSignedUrl(key);
      return res.status(200).json({
        success: true,
        message: "User profile fetch Signedurl",
        data: result
      });
    } catch (err) {
      new ErrorHandler(err, 500)
    }
  },


  // [ + ] BLOCK USER  BY ADMIN LOGIC

  async blockUser(req, res, next) {
    try {
      const testId = CheckMongoID(req.params.id);
      if (!testId) {
        return next(ErrorHandler.wrongCredentials("Wrong MongoDB Id"));
      }
      const user = await UserModel.findById(req.params.id);

      if (!user) {
        return next(ErrorHandler.notFound(`User Not Found`));
      }

      let DeactivatedUser = {
        status: "Blocked",
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

      res.status(200).json({
        success: true,
        updatedUser,
        message: "User Blocked Successfully By Admin",
      });
    } catch (error) {
      return next(ErrorHandler.serverError(error));
    }
  },

  // [ + ] Delete User - Admin

  async removeUser(req, res, next) {
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

      await user.remove();

      res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
      });
    } catch (error) {
      return next(ErrorHandler.serverError(error));
    }
  },
};

export default UserController;
