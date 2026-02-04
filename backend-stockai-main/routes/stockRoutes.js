import express from "express";
import { addStockMovement } from "../controllers/stockController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Apply middleware once for all routes
router.use(protect);

// Record stock movement
router.post("/", addStockMovement);

export default router;
