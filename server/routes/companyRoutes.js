import express from "express";
import upload from "../middlewares/multer.js";
import authCompany from "../middlewares/authCompany.js";
import {
  registerCompany,
  loginCompany,
  getCompanyProfile,
  getallCompanies,
  updateCompanyImage,
  postJob,
  getCompanyPostedJobs,
  getCompanyJobApplications,
  changeJobApplicationStatus,
  changeJobVisibility,
} from "../controllers/companyController.js";

const router = express.Router();

// Public routes
router.get("/all", getallCompanies);
router.post("/register", upload.single("image"), registerCompany);
router.post("/login", loginCompany);

// Protected routes
router.get("/profile", authCompany, getCompanyProfile);
router.put("/update-image", authCompany, upload.single("image"), updateCompanyImage);
router.post("/post-job", authCompany, postJob);
router.get("/posted-jobs", authCompany, getCompanyPostedJobs);
router.get("/applications", authCompany, getCompanyJobApplications);
router.patch("/applications/:applicationId/status", authCompany, changeJobApplicationStatus);
router.patch("/jobs/:jobId/visibility", authCompany, changeJobVisibility);

export default router;