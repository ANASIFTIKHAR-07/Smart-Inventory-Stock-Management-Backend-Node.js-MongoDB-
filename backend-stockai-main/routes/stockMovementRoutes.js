import express from "express";
import {
  addStockMovement,
  getStockMovements,
} from "../controllers/stockMovementController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "staff"));

router.post("/", addStockMovement);
router.get("/:productId", getStockMovements);

export default router;
