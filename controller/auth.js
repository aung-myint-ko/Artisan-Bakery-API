import User from "../modules/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CreateError } from "./error.js";

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
        })
        .status(200)
        .json(other);
    }
  } catch (err) {
    next(err);
  }
};
export const SignInAdmin = async (req, res, next) => {
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
    }
    if (!findUser.isAdmin) {
      next(CreateError(403, "You are not admin, Only admins are allowed"));
    } else {
      const token = jwt.sign({ id: findUser._id }, process.env.TOKEN_KEY);
      const { password, ...other } = findUser._doc;
      res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .status(200)
        .json(other);
    }
  } catch (err) {
    next(err);
  }
};

export const LogOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("log out successfully");
  } catch (err) {
    next(err);
  }
};

export const UpdatingHistory = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const sendingHistory = await User.findByIdAndUpdate(customerId, {
      $push: { history: [req.body] },
    });
    res.status(200).json(sendingHistory);
  } catch (err) {
    next(err);
  }
};

export const AddingPhoto = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const putPhoto = await User.findByIdAndUpdate(customerId, req.body);
    res.status(200).json(putPhoto);
  } catch (err) {
    next(err);
  }
};

export const GetUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
