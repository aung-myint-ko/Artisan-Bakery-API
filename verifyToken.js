import jwt from "jsonwebtoken";
import { CreateError } from "./controller/error.js";

export const verifyToken = (req, res, next) => {
  const cookie = req.cookies.access_token;
  console.log(token);
  if (!cookie) return next(CreateError(401, "You are not authenticated"));
  jwt.verify(cookie, process.env.TOKEN_KEY, (err, user) => {
    if (err) return next(CreateError(403, "Token is not valid"));
    req.user = user;
    next();
  });
};
