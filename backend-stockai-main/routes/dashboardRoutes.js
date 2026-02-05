import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "staff"));

router.get("/summary", getDashboardSummary);

export default router;
