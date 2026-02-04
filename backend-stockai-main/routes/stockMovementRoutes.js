import express from "express";
import {
  addStockMovement,
  getStockMovements,
} from "../controllers/stockMovementController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Apply middleware once for all routes
router.use(protect);

// POST: Add stock IN/OUT
router.post("/", addStockMovement);

// GET: Stock movement history for a product
router.get("/:productId", getStockMovements);

export default router;
