import "./config/instrument.js";

import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";

import clerkWebhooks from "./controllers/webhooks.js";

// App Config
const app = express();

// Database Connection
connectDB();

// Clerk Webhook Route
app.post(
  "/webhooks",
  express.raw({
    type: "application/json",
  }),
  clerkWebhooks
);

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("API Working Successfully");
});

// Test Sentry
app.get("/debug-sentry", (req, res) => {
  throw new Error(
    "My first Sentry error!"
  );
});

// Sentry Error Handler
Sentry.setupExpressErrorHandler(app);

// Port
const PORT =
  process.env.PORT || 5000;

// Listen Server
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});