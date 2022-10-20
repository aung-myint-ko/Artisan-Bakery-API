import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    history: {
      type: [
        {
          date: {
            type: String,
          },
          hour: { type: String },
          quantity: { type: Number },
          amount: { type: Number },
          foods: {
            type: [],
          },
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
