import express from "express";
const router = express.Router();
import {
  AddingRecipe,
  DeleteRecipe,
  SearchByVariety,
  ShowAllRecipes,
  ShowOneRecipe,
  UpdateRecipe,
} from "../controller/recipes.js";
import { verifyToken } from "../verifyToken.js";

router.post("/add", verifyToken, AddingRecipe);
router.get("/show", ShowAllRecipes);
router.get("/show/find", SearchByVariety);
router.get("/show/:slug", ShowOneRecipe);
router.put("/update/:slug", verifyToken, UpdateRecipe);
router.delete("/delete/:slug", verifyToken, DeleteRecipe);

export default router;
