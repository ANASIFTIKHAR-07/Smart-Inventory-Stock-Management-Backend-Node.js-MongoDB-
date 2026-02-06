import express from "express";
import {
  addStockMovement,
  getStockMovements,
} from "../controllers/stockMovementController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "staff"));

router.post("/", addStockMovement);
router.get("/:productId", validateObjectId("productId"), getStockMovements);

export default router;
