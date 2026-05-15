import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { uploadImage } from "../config/cloudinary.js";
import fs from "fs";

// ─── Register Company ────────────────────────────────────────────────────────
export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields",
      });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company already registered with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl = "";
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile.path);
      } catch (uploadError) {
        console.error("Image upload skipped:", uploadError.message);
        imageUrl = "";
      } finally {
        if (fs.existsSync(imageFile.path)) {
          fs.unlinkSync(imageFile.path);
        }
      }
    }

    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    const token = generateToken(company._id);

    return res.status(201).json({
      success: true,
      message: "Company registered successfully",
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("registerCompany error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login Company ───────────────────────────────────────────────────────────
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(company._id);

    return res.json({
      success: true,
      message: "Login successful",
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token,
    });
  } catch (error) {
    console.error("loginCompany error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Company Profile ─────────────────────────────────────────────────────
export const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.company._id).select("-password");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.json({ success: true, company });
  } catch (error) {
    console.error("getCompanyProfile error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Companies ────────────────────────────────────────────────────────
export const getallCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select("-password");

    return res.json({
      success: true,
      companies,
    });
  } catch (error) {
    console.error("getallCompanies error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Company Image ─────────────────────────────────────────────────────
export const updateCompanyImage = async (req, res) => {
  try {
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    let imageUrl = "";
    try {
      imageUrl = await uploadImage(imageFile.path);
    } catch (uploadError) {
      console.error("Image upload failed:", uploadError.message);
      return res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    } finally {
      if (fs.existsSync(imageFile.path)) {
        fs.unlinkSync(imageFile.path);
      }
    }

    const company = await Company.findByIdAndUpdate(
      req.company._id,
      { image: imageUrl },
      { new: true }
    ).select("-password");

    return res.json({
      success: true,
      message: "Image updated successfully",
      company,
    });
  } catch (error) {
    console.error("updateCompanyImage error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Post a Job ──────────────────────────────────────────────────────────────
export const postJob = async (req, res) => {
  try {
    const { title, description, location, salary, level, category } = req.body;

    if (!title || !description || !location || !salary || !level || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all job fields",
      });
    }

    const job = await Job.create({
      title,
      description,
      location,
      salary,
      level,
      category,
      companyId: req.company._id,
      date: Date.now(),
      visible: true,
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.error("postJob error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Company Posted Jobs ──────────────────────────────────────────────────
export const getCompanyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.company._id });

    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await JobApplication.countDocuments({
          jobId: job._id,
        });
        return { ...job.toObject(), applicantCount };
      })
    );

    return res.json({
      success: true,
      jobs: jobsWithCount,
    });
  } catch (error) {
    console.error("getCompanyPostedJobs error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Company Job Applications ─────────────────────────────────────────────
export const getCompanyJobApplications = async (req, res) => {
  try {
    const companyJobs = await Job.find({
      companyId: req.company._id,
    }).select("_id");

    const jobIds = companyJobs.map((job) => job._id);

    const applications = await JobApplication.find({ jobId: { $in: jobIds } })
      .populate("userId", "name email image resume")
      .populate("jobId", "title location salary level category")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("getCompanyJobApplications error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Change Job Application Status ───────────────────────────────────────────
export const changeJobApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use: pending, accepted, or rejected",
      });
    }

    const application = await JobApplication.findById(applicationId).populate(
      "jobId",
      "companyId"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      application.jobId.companyId.toString() !== req.company._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this application",
      });
    }

    application.status = status;
    await application.save();

    return res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (error) {
    console.error("changeJobApplicationStatus error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Change Job Visibility ────────────────────────────────────────────────────
export const changeJobVisibility = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({
      _id: jobId,
      companyId: req.company._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or unauthorized",
      });
    }

    job.visible = !job.visible;
    await job.save();

    return res.json({
      success: true,
      message: `Job is now ${job.visible ? "visible" : "hidden"}`,
      job,
    });
  } catch (error) {
    console.error("changeJobVisibility error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
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
};