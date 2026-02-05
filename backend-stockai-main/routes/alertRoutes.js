import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getAlerts } from "../controllers/alertController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "staff"));

router.get("/", getAlerts);

export default router;


