import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAlerts } from "../controllers/alertController.js";

const router = express.Router();

router.use(protect);

router.get("/", getAlerts);

export default router;


