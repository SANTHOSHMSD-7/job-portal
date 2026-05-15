
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

// ─── Get All Jobs ─────────────────────────────────────────────────────────────
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ visible: true })
      .populate("companyId", "name image email")
      .sort({ date: -1 });

    return res.json({ success: true, jobs });
  } catch (error) {
    console.error("getJobs error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Job ───────────────────────────────────────────────────────────
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("companyId", "name image email");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.json({ success: true, job });
  } catch (error) {
    console.error("getJobById error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Apply For Job ────────────────────────────────────────────────────────────
export const applyForJob = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const userId = req.user._id;

    // Check if already applied
    const existingApplication = await JobApplication.findOne({ jobId, userId });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const application = await JobApplication.create({
      jobId,
      userId,
      resume: req.user.resume || "",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Applied successfully",
      application,
    });
  } catch (error) {
    console.error("applyForJob error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get User Applications ────────────────────────────────────────────────────
export const getUserApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ userId: req.user._id })
      .populate("jobId", "title location salary level category companyId")
      .sort({ createdAt: -1 });

    return res.json({ success: true, applications });
  } catch (error) {
    console.error("getUserApplications error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};