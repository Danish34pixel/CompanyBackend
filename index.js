// Simple Express backend for signup and login
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import billRoutes from "./routes/billRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Configure CORS to allow the frontend deployment and local dev
const defaultAllowed = [
  "https://billing-chi-peach.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : defaultAllowed;

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // reject unknown origins
    return callback(null, false);
  },
};

// Allow all origins when DEBUG_ALLOW_ALL is set (temporary debugging only)
// For temporary debugging in deployment, always allow all origins.
// WARNING: This makes the API accept requests from any origin. Remove this in production.
app.use(cors());
// Also accept preflight for all routes
app.options("*", cors());

console.log("Allowed CORS origins:", allowedOrigins);

// Debug endpoint to check allowed origins at runtime
app.get("/api/debug/origins", (req, res) => {
  res.json({
    allowedOrigins,
    debugAllowAll: process.env.DEBUG_ALLOW_ALL === "true",
  });
});
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
