import Recipes from "../modules/Recipes.js";
import User from "../modules/User.js";
import { CreateError } from "./error.js";
import cloudinary from "../cloudinary.js";
import slugify from "slugify";
import _ from "lodash";

export const AddingRecipe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.isAdmin) {
      const { name, image } = req.body;
      const public_id = slugify(name, { lower: true });
      const imageLink = await cloudinary.v2.uploader.upload(image, {
        folder: "artisan-bakery/recipes",
        public_id,
      });
      const newRecipe = new Recipes({
        ...req.body,
        imageId: imageLink.public_id,
        imageUrl: imageLink.secure_url,
      });
      await newRecipe.save();
      res.status(201).json("successfully created and added one recipe");
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
    let imageLink, slug;
    let imageValue = false;
    const { name, image, variety, desc, price } = req.body;
    const params = req.params.slug;
    const user = await User.findById(req.user.id);
    if (user.isAdmin) {
      const findRecipe = await Recipes.findOne({ slug: params });
      if (!findRecipe) next(CreateError(404, "recipe not found"));

      //Check whether new name is given or not
      if (name) {
        slug = slugify(name, { lower: true });
      }
      //Check whether new image is given or not
      if (image) {
        await cloudinary.v2.uploader.destroy(findRecipe.imageId);
        imageLink = await cloudinary.v2.uploader.upload(image, {
          folder: "artisan-bakery/recipes",
          public_id: name ? slug : findRecipe.slug,
        });
        imageValue = true;
      }
      const updatedRecipe = await Recipes.findOneAndUpdate(
        { slug: params },
        {
          $set: {
            name: name || findRecipe.name,
            slug: slug || findRecipe.slug,
            variety: variety || findRecipe.variety,
            desc: desc || findRecipe.desc,
            imageId: imageValue ? imageLink.public_id : findRecipe.imageId,
            imageUrl: imageValue ? imageLink.secure_url : findRecipe.imageUrl,
            price: price || findRecipe.price,
          },
        },
        { new: true }
      );
      res.status(201).json(updatedRecipe);
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

export const DeleteAllRecipes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.isAdmin) {
      await Recipes.deleteMany({});
      res.status(200).json("Successfully deleted");
    } else {
      res.status(403).json("Only admin can delete the data");
    }
  } catch (err) {
    next(err);
  }
};
