// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import billRoutes from "./routes/billRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
/* =======================
   DATABASE CONNECTION
======================= */
connectDB();

/* =======================
   CORS CONFIGURATION
   - Reads allowed origins from `ALLOWED_ORIGINS` env (comma-separated)
   - If `DEBUG_ALLOW_ALL` is set to "true" allow requests with any origin
======================= */
const defaultOrigins = [
  "https://billing-chi-peach.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : [];

const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;
const debugAllowAll =
  String(process.env.DEBUG_ALLOW_ALL || "false").toLowerCase() === "true";

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl)
      if (!origin) return callback(null, true);

      if (debugAllowAll) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS not allowed for origin: ${origin}`),
        false
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());

/* =======================
   ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);

/* =======================
   HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀",
  });
});

/* =======================
   SERVER START
======================= */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("✅ Allowed CORS Origins:", allowedOrigins);
});
