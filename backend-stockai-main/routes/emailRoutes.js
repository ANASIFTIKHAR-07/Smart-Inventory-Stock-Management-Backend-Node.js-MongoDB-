import express from "express";
import { sendEmailController, sendPurchaseOrderEmailController } from "../controllers/emailController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "staff"));

router.post("/generic", sendEmailController);
router.post("/purchase-order", sendPurchaseOrderEmailController);

export default router;
