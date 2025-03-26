import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { config } from "./config";
import { errorHandler } from "./middleware/error";
import "./utils/warnings";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user";
import teamRoutes from "./routes/team";
import courseRoutes from "./routes/course";
import analyticsRoutes from "./routes/analytics";
import studentRoutes from "./routes/student";
import authRoutes from "./routes/auth";
import settingRoutes from "./routes/setting";
import aiRoutes from "./routes/ai";
import courseStatsRoutes from "./routes/courseStats";
import githubRoutes from "./routes/github";

dotenv.config();

// Disable punycode warning
process.removeAllListeners("warning");
process.on("warning", (warning) => {
  if (
    warning.name === "DeprecationWarning" &&
    warning.message.includes("punycode")
  ) {
    return;
  }
  console.warn(warning);
});

// Check necessary environment variables when app starts
const requiredEnvVars = ["GITHUB_TOKEN", "MONGODB_URI"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const app = express();

// Middleware
// Allow multiple sources
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Vite default port
  "http://localhost:4173", // Vite preview
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (like development tools or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Database connection
mongoose
  .connect(config.mongodb.uri, {
    // No need for useNewUrlParser and useUnifiedTopology
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/course-stats", courseStatsRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/teams/export", teamRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.server.port || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
