import Recipes from "../modules/Recipes.js";
import User from "../modules/User.js";
import { CreateError } from "./error.js";

export const AddingRecipe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.isAdmin) {
      const newRecipe = new Recipes(req.body);
      const savedRecipe = await newRecipe.save();
      res.status(201).json("successfully Created and added one recipe");
    } else {
      res.status(403).json("Only admin can create the data");
    }
  } catch (err) {
    next(err);
  }
};

export const ShowOneRecipe = async (req, res, next) => {
  try {
    const params = req.params.slug;
    const recipe = await Recipes.findOne({ slug: params });
    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
};

export const ShowAllRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipes.find();
    res.status(201).json(recipes);
  } catch (err) {
    next(err);
  }
};

export const UpdateRecipe = async (req, res, next) => {
  try {
    const params = req.params.slug;
    const user = await User.findById(req.user.id);
    if (user.isAdmin) {
      const findRecipe = await Recipes.findOne({ slug: params });
      if (!findRecipe) next(CreateError(404, "recipe not found"));
      const recipe = await Recipes.findOneAndUpdate(
        { slug: params },
        { $set: req.body },
        { new: true }
      );
      res.status(201).json(recipe);
    } else {
      next(CreateError(403, "Only admin can update the data"));
    }
  } catch (err) {
    next(err);
  }
};

export const SearchByVariety = async (req, res, next) => {
  try {
    const variety = req.query.variety;
    const recipe = await Recipes.find({ variety: variety });
    res.status(200).json(recipe);
  } catch (err) {
    next(err);
  }
};

export const DeleteRecipe = async (req, res, next) => {
  try {
    const params = req.params.slug;
    const user = await User.findById(req.user.id);
    if (user.isAdmin) {
      const findRecipe = await Recipes.findOne({ slug: params });
      if (!findRecipe) next(CreateError(404, "recipe not found"));
      await Recipes.findOneAndDelete({ slug: params });
      res.status(200).json("Successfully deleted");
    } else {
      res.status(403).json("Only admin can delete the data");
    }
  } catch (err) {
    next(err);
  }
};
