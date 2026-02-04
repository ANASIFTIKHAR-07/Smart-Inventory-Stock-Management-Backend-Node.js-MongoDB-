import express from "express";
import { sendEmailController, sendPurchaseOrderEmailController } from "../controllers/emailController.js";

const router = express.Router();

// Generic email
router.post("/generic", sendEmailController);

// Purchase order email
router.post("/purchase-order", sendPurchaseOrderEmailController);

export default router;
