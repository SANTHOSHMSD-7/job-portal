import { Webhook } from "svix";
import User from "../models/User.js";

const clerkWebhooks = async (req, res) => {

  try {

    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await webhook.verify(
      JSON.stringify(req.body),
      {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      }
    );

    const { data, type } = req.body;

    // User Created
    if (type === "user.created") {

      const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address,
        name: data.first_name + " " + data.last_name,
        image: data.image_url,
        resume: "",
      };

      await User.create(userData);

    }

    // User Deleted
    if (type === "user.deleted") {

      await User.findByIdAndDelete(data.id);

    }

    res.json({
      success: true,
      message: "Webhook received",
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });

  }

};

export default clerkWebhooks;