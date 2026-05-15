import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import { uploadImage } from "../config/cloudinary.js";
import fs from "fs";

// ─── Get User Data ─────────────────────────────────────────────
export const getUserData = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(
      "getUserData error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

// ─── Apply For Job ─────────────────────────────────────────────
export const applyForJob =
  async (req, res) => {
    try {
      const { jobId } =
        req.body;

      const userId =
        req.user._id;

      // Check Job ID
      if (!jobId) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Job ID is required",
          });
      }

      // Check job exists
      const job =
        await Job.findById(
          jobId
        );

      if (!job) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Job not found",
          });
      }

      // Already Applied Check
      const alreadyApplied =
        await JobApplication.findOne(
          {
            jobId,
            userId,
          }
        );

      if (
        alreadyApplied
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Already applied for this job",
          });
      }

      // Create Application
      const application =
        await JobApplication.create(
          {
            jobId,
            userId,
            companyId:
              job.companyId,

            // FIXED HERE
            status:
              "pending",

            date:
              Date.now(),

            resume:
              req.user
                ?.resume ||
              "",
          }
        );

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Applied Successfully",
          application,
        });
    } catch (error) {
      console.log(
        "applyForJob error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            error.message,
        });
    }
  };

// ─── Get User Applied Jobs ─────────────────────────────────────
export const getUserApplications =
  async (req, res) => {
    try {
      const applications =
        await JobApplication.find(
          {
            userId:
              req.user._id,
          }
        )
          .populate({
            path: "jobId",
            model: "Job",
            populate: {
              path:
                "companyId",
              model:
                "Company",
              select:
                "name image",
            },
          })
          .sort({
            createdAt: -1,
          });

      // Remove broken jobs
      const validApplications =
        applications.filter(
          (item) =>
            item.jobId
        );

      return res.status(200).json({
        success: true,
        applications:
          validApplications,
      });
    } catch (error) {
      console.log(
        "getUserApplications error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ─── Update User Resume ────────────────────────────────────────
export const updateUserResume =
  async (req, res) => {
    try {
      const resumeFile =
        req.file;

      if (
        !resumeFile
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please upload resume",
          });
      }

      let resumeUrl =
        "";

      try {
        resumeUrl =
          await uploadImage(
            resumeFile.path
          );
      } catch (
        uploadError
      ) {
        console.log(
          "Resume upload error:",
          uploadError.message
        );
      } finally {
        if (
          fs.existsSync(
            resumeFile.path
          )
        ) {
          fs.unlinkSync(
            resumeFile.path
          );
        }
      }

      const updatedUser =
        await User.findByIdAndUpdate(
          req.user._id,
          {
            resume:
              resumeUrl,
          },
          {
            new: true,
          }
        ).select(
          "-password"
        );

      return res.status(200).json({
        success: true,
        message:
          "Resume Updated Successfully",
        user:
          updatedUser,
      });
    } catch (error) {
      console.log(
        "updateUserResume error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

export default {
  getUserData,
  applyForJob,
  getUserApplications,
  updateUserResume,
};