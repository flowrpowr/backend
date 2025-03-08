import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import uploadRouter from "./routes/uploadRouter";
import streamRouter from "./routes/streamRouter";

dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 11111;

// fun middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/upload", uploadRouter);
app.use("/stream", streamRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Flowr backend server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});
