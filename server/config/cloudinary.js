import { v2 as cloudinary } from "cloudinary";
import https from "https";

// Fix SSL issue on Windows
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    await cloudinary.api.ping();
    console.log("Cloudinary Connected ✅");
  } catch (error) {
    console.error("Cloudinary connection failed ❌:", error.message);
  }
};

export const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      secure: true,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    throw new Error("Image upload failed: " + error.message);
  }
};

export default connectCloudinary;