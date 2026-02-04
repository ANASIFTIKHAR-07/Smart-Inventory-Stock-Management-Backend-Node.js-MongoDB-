import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Apply middleware once for all routes
router.use(protect);

router.get("/summary", getDashboardSummary);

export default router;
