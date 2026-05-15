import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Clerk's user ID is a string like "user_abc123"
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      default: "", // NOT required — Clerk users don't have passwords here
    },
    image: {
      type: String,
      default: "",
    },
    resume: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "user",
    },
  },
  {
    timestamps: true,
    _id: false, // Disable auto ObjectId generation — we supply _id from Clerk
  }
);

const User = mongoose.model("User", userSchema);

export default User;