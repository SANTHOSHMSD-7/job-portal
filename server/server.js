import "./config/instrument.js";

import express from "express";
import cors from "cors";
import "dotenv/config";
import * as Sentry from "@sentry/node";
import { clerkMiddleware } from "@clerk/express";

import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";
import clerkWebhooks from "./controllers/webhooks.js";
import companyRouter from "./routes/companyRoutes.js";
import jobRouter from "./routes/jobRoutes.js";
import userRouter from "./routes/userRoutes.js";

// App Config
const app = express();

// Database & Cloudinary Connection
await connectDB();
await connectCloudinary();

// ⚠️ Webhook route MUST come before express.json()
app.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// Middlewares
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// Routes
app.get("/", (req, res) => {
  res.send("API Working Successfully");
});

app.use("/api/company", companyRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/users", userRouter);

// Test Sentry
app.get("/debug-sentry", (req, res) => {
  throw new Error("My first Sentry error!");
});

// Sentry Error Handler
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});