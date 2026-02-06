// ──────────────────────────────
// index.js - SmartStock AI Backend
// ──────────────────────────────

// ✅ Load environment variables first
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// ✅ Import routes
import { GoogleGenerativeAI } from "@google/generative-ai";
import authRoutes from "./routes/authRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import stockMovementRoutes from "./routes/stockMovementRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import aiAnalyticsRoutes from "./routes/aiAnalyticsRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));

// ✅ Route usage
app.use("/api/auth", authRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/ai-analytics", aiAnalyticsRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/email", emailRoutes);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("SmartStock AI Backend is Running 🚀");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// // ✅ Check email env variables
// console.log("Email User:", process.env.EMAIL_USER);
// console.log("Email Pass:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Gemini Model setup
let model;
try {
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log("✅ Gemini model loaded: gemini-1.5-flash");
} catch (err) {
  console.warn("⚠️ gemini-1.5-flash not available, falling back to pro model");
  model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  console.log("✅ Gemini model loaded: gemini-1.5-pro");
}
