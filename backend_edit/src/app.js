const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const statsRoutes = require("./routes/statsRoutes");
const visitRoutes = require("./routes/visitRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    platform: "StayNearRungta API",
    version: "1.0.0",
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/visits", visitRoutes);

// ─── Error handling (must be last) ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
