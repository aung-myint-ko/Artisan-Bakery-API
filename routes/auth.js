import express from "express";
import {
  SignInAdmin,
  SignIn,
  SignUp,
  LogOut,
  UpdatingHistory,
  GetUserInfo,
  AddingPhoto,
} from "../controller/auth.js";
import { verifyToken } from "../verifyToken.js";
const router = express.Router();

router.post("/admin/signup", SignUp);
router.post("/admin/signin", SignInAdmin);
router.post("/signup", SignUp);
router.post("/signin", SignIn);
router.post("/logout", LogOut);
router.put("/customer/history", verifyToken, UpdatingHistory);
router.put("/customer/image", verifyToken, AddingPhoto);
router.get("/customer/:id", verifyToken, GetUserInfo);

export default router;
