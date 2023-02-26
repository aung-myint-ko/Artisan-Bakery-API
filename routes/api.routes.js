import express from "express";
const router = express.Router();

import {
  AddingRecipe,
  DeleteAllRecipes,
  DeleteRecipe,
  SearchByVariety,
  ShowAllRecipes,
  ShowOneRecipe,
  UpdateRecipe,
} from "../controller/recipes.js";
import {
  SignInAdmin,
  SignIn,
  SignUp,
  LogOut,
  UpdatingHistory,
  GetUserInfo,
  AddingPhoto,
  GetAllUser,
  DeleteUser,
  DeleteAllUser,
} from "../controller/auth.js";
import { verifyToken } from "../verifyToken.js";

// Admin, User, Auth related routes

//Admin Auth Routes[Start]
router.post("/admin/signup", SignUp);
router.post("/admin/signin", SignInAdmin);
//Admin Auth Routes[End]

//User Auth and Profile Routes[Start]
router.post("/user/signup", SignUp);
router.post("/user/signin", SignIn);
router.post("/user/logout", LogOut);
router.put("/user/history", verifyToken, UpdatingHistory);
router.put("/user/image", verifyToken, AddingPhoto);
router.get("/user/info", verifyToken, GetUserInfo);
router.get("/user", verifyToken, GetAllUser);
router.delete("/user/:id", verifyToken, DeleteUser);
router.delete("/user", verifyToken, DeleteAllUser);

//User Auth and Profile Routes[End]

//Recipe CURD Routes[Start]
router.post("/recipe", verifyToken, AddingRecipe);
router.get("/recipe", ShowAllRecipes);
router.get("/recipe/find", SearchByVariety);
router.get("/recipe/:slug", ShowOneRecipe);
router.put("/recipe/:slug", verifyToken, UpdateRecipe);
router.delete("/recipe/:slug", verifyToken, DeleteRecipe);
router.delete("/recipe", verifyToken, DeleteAllRecipes);

//Recipe CURD Routes[End]

export default router;
