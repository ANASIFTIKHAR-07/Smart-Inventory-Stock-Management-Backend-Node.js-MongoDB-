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
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

// Public approval route (no auth) - validation handled in controller if needed
router.get("/:id/approve/:token", approvePurchaseOrderViaLink);

router.use(protect);

// Admin or staff: create, read, update status
router.post("/", authorize("admin", "staff"), createPurchaseOrder);
router.get("/", authorize("admin", "staff"), getPurchaseOrders);
router.get("/:id", validateObjectId("id"), authorize("admin", "staff"), getPurchaseOrderById);
router.put("/:id/status", validateObjectId("id"), authorize("admin", "staff"), updatePurchaseOrderStatus);

// Admin only: delete purchase order
router.delete("/:id", validateObjectId("id"), authorize("admin"), deletePurchaseOrder);

export default router;
