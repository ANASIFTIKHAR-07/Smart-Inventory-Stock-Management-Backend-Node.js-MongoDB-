import express from "express";
import { addStockMovement } from "../controllers/stockController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "staff"));

router.post("/", addStockMovement);

export default router;
