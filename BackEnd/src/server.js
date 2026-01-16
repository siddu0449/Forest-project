const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Safari Management API",
    version: "1.0.0",
    status: "running",
  });
});

// API Routes
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/vehicle-driver", require("./routes/vehicleDriverRoutes"));
app.use(
  "/api/vehicle-assignments",
  require("./routes/vehicleAssignmentRoutes")
);
app.use("/api/auth", require("./routes/authRoutes"));

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL}`);
});

module.exports = app;
