import express from "express";
import {
  getJobs,
  getJobById,
  applyForJob,
  getUserApplications,
} from "../controllers/jobController.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

// Get all jobs
router.get("/", getJobs);

// Get single job by ID
router.get("/:id", getJobById);

// Apply for a job (user must be logged in)
router.post("/:id/apply", authUser, applyForJob);

// Get user's applied jobs
router.get("/user/applications", authUser, getUserApplications);

export default router;