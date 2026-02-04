import express from "express";
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
  approvePurchaseOrderViaLink
} from "../controllers/purchaseOrderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public approval route (no auth)
router.get("/:id/approve/:token", approvePurchaseOrderViaLink);

// ✅ Apply middleware once for remaining routes
router.use(protect);

// POST: Create new purchase order
router.post("/", createPurchaseOrder);

router.get("/:id", getPurchaseOrderById);

// GET: Get all purchase orders
router.get("/", getPurchaseOrders);

// PUT: Update purchase order status
router.put("/:id/status", updatePurchaseOrderStatus);

// ✅ Delete Purchase Order
router.delete("/:id", deletePurchaseOrder);

export default router;
