import { Webhook } from "svix";
import User from "../models/User.js";

const clerkWebhooks = async (req, res) => {
  try {
    console.log("Webhook Hit");

    // Verify Clerk Webhook
    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const payload = webhook.verify(req.body, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = payload;

    console.log("Webhook type:", type);
    console.log("Webhook data:", data);

    // Common User Data
    const userData = {
      _id: data.id,
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      email: data?.email_addresses?.[0]?.email_address || "",
      image: data.image_url || "",
      resume: "",
    };

    // USER CREATED
    if (type === "user.created") {
      const newUser = new User(userData);
      await newUser.save();
      console.log("User Saved:", newUser);
    }

    // USER UPDATED
    if (type === "user.updated") {
      const updated = await User.findByIdAndUpdate(
        data.id,
        {
          name: userData.name,
          email: userData.email,
          image: userData.image,
        },
        { new: true }
      );
      console.log("User Updated:", updated);
    }

    // USER DELETED
    if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
      console.log("User Deleted:", data.id);
    }

    return res.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Webhook Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;