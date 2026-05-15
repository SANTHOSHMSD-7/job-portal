import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";

const authUser = async (
  req,
  res,
  next
) => {
  try {

    const { userId } =
      getAuth(req);

    console.log(
      "Clerk User ID:",
      userId
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized - Please login",
      });
    }

    // Find user in MongoDB
    let user =
      await User.findById(
        userId
      );

    // If user doesn't exist → create automatically
    if (!user) {

      const clerkUser =
        await clerkClient.users.getUser(
          userId
        );

      const userData = {
        _id:
          clerkUser.id,

        name: `${clerkUser.firstName || ""
          } ${clerkUser.lastName || ""
          }`.trim(),

        email:
          clerkUser
            .emailAddresses?.[0]
            ?.emailAddress || "",

        image:
          clerkUser.imageUrl || "",

        password: "",
        resume: "",
        role: "user",
      };

      user =
        await User.create(
          userData
        );

      console.log(
        "New User Saved:",
        user
      );
    }

    req.user = user;

    next();

  } catch (error) {

    console.error(
      "authUser error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

export default authUser;