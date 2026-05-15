import express from "express";
import upload from "../middlewares/multer.js";
import authUser from "../middlewares/authUser.js";
import {
  getUserData,
  applyForJob,
  getUserApplications,
  updateUserResume,
} from "../controllers/userController.js";

const router = express.Router();

// Get user data
router.get("/data", authUser, getUserData);

// Apply for a job
router.post("/apply", authUser, applyForJob);

// Get user applied applications
router.get("/applications", authUser, getUserApplications);

// Update user resume
router.put("/update-resume", authUser, upload.single("resume"), updateUserResume);

export default router;