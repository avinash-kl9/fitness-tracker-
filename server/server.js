import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import trackerRoutes from "./routes/tracker.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

app.get("/", (_req, res) => res.send("FitTrack API is running."));
app.use("/api/auth", authRoutes);
app.use("/api/tracker", trackerRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => console.log(`API running on port ${process.env.PORT || 5000}`));
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};
start();
