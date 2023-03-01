import User from "../modules/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { CreateError } from "./error.js";
import cloudinary from "../cloudinary.js";
import slugify from "slugify";

//signup function for both user and admin
export const SignUp = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hash });
    const savedUser = await newUser.save();
    const token = jwt.sign({ id: savedUser._id }, process.env.TOKEN_KEY);

    const { password, ...other } = savedUser._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(201)
      .json(other);
  } catch (err) {
    next(err);
  }
};

//signin function for user
export const SignIn = async (req, res, next) => {
  try {
    const findUser = await User.findOne({
      $or: [{ name: req.body.name }, { email: req.body.email }],
    });
    if (!findUser) next(CreateError(400, "User not found"));
    const comparePassword = await bcrypt.compare(
      req.body.password,
      findUser.password
    );
    if (!comparePassword) {
      next(CreateError(403, "Your password is incorrect"));
    } else {
      const token = jwt.sign({ id: findUser._id }, process.env.TOKEN_KEY);
      const { password, ...other } = findUser._doc;
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: new Date(Date.now() + 86400000), // 86400000 milliseconds = 1 day
        })
        .status(200)
        .json(other);
    }
  } catch (err) {
    next(err);
  }
};

//signin function for admin
export const SignInAdmin = async (req, res, next) => {
  try {
    const findUser = await User.findOne({
      $or: [{ name: req.body.name }, { email: req.body.email }],
    });
    if (!findUser) next(CreateError(400, "Admin not found"));
    const comparePassword = await bcrypt.compare(
      req.body.password,
      findUser.password
    );
    if (!comparePassword) {
      next(CreateError(403, "Your password is incorrect"));
    }
    if (!findUser.isAdmin) {
      next(CreateError(403, "You are not admin, Only admins are allowed"));
    } else {
      const token = jwt.sign({ id: findUser._id }, process.env.TOKEN_KEY);
      const { password, ...other } = findUser._doc;
      const serialized = serialize("access_token", token, {
        sameSite: "none",
        path: "/",
        secure: true,
      });
      res.setHeader("Set-Cookie", serialized);
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: new Date(Date.now() + 86400000), // 86400000 milliseconds = 1 day
        })
        .status(200)
        .json(other);
    }
  } catch (err) {
    next(err);
  }
};
//logout function for both user and admin
export const LogOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("log out successfully");
  } catch (err) {
    next(err);
  }
};
//updating user cart history detail
export const UpdatingHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sendingHistory = await User.findByIdAndUpdate(userId, {
      $push: { history: [req.body] },
    });
    res.status(200).json(sendingHistory);
  } catch (err) {
    next(err);
  }
};
//updating user photo
export const AddingPhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const public_id = slugify(user.name, { lower: true });
    if (user.imageUrl.length > 0) {
      await cloudinary.v2.uploader.destroy(user.imageId);
    }
    const imageLink = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "artisan-bakery/user",
      public_id,
    });

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          imageId: imageLink.public_id,
          imageUrl: imageLink.secure_url,
        },
      },
      { new: true }
    );
    res.status(200).json("Photo Updated");
  } catch (err) {
    next(err);
  }
};
//get user details who currently login
export const GetUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
//get all users details who register
export const GetAllUser = async (req, res, next) => {
  try {
    const user = await User.find({});
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
//delete specific user [only for admin]
export const DeleteUser = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.isAdmin) {
      const user = await User.findByIdAndDelete(req.params.id);
      await cloudinary.v2.uploader.destroy(user.imageId);
      res.status(200).json("Successfully Deleted");
    } else {
      res.status(403).json("Only admin can delete");
    }
  } catch (error) {
    next(error);
  }
};
//delete all users [only for admin]
export const DeleteAllUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.isAdmin) {
      const users = await User.find({});
      users.map(async (user) => {
        await cloudinary.v2.uploader.destroy(user.imageId);
      });
      await User.deleteMany({ isAdmin: false });
      res.status(200).json("All account have been deleted");
    } else {
      res.status(403).json("Only admin can delete");
    }
  } catch (error) {
    next(error);
  }
};
