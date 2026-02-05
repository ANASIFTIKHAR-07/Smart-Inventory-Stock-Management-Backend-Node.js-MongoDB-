import express from "express";
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
  approvePurchaseOrderViaLink
} from "../controllers/purchaseOrderController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public approval route (no auth)
router.get("/:id/approve/:token", approvePurchaseOrderViaLink);

router.use(protect);

// Admin or staff: create, read, update status
router.post("/", authorize("admin", "staff"), createPurchaseOrder);
router.get("/", authorize("admin", "staff"), getPurchaseOrders);
router.get("/:id", authorize("admin", "staff"), getPurchaseOrderById);
router.put("/:id/status", authorize("admin", "staff"), updatePurchaseOrderStatus);

// Admin only: delete purchase order
router.delete("/:id", authorize("admin"), deletePurchaseOrder);

export default router;
