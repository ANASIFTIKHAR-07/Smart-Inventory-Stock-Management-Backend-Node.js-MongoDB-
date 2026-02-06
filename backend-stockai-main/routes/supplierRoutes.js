import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deactivateSupplier,
  getSupplierPerformance,
  getSuppliersPerformance,
} from "../controllers/supplierController.js";

const router = express.Router();

router.use(protect);

// Admin or staff: create, read, update, performance
router.post("/", authorize("admin", "staff"), createSupplier);
router.get("/", authorize("admin", "staff"), getSuppliers);
router.get("/performance", authorize("admin", "staff"), getSuppliersPerformance);
router.get("/:id", validateObjectId("id"), authorize("admin", "staff"), getSupplierById);
router.put("/:id", validateObjectId("id"), authorize("admin", "staff"), updateSupplier);
router.get("/:id/performance", validateObjectId("id"), authorize("admin", "staff"), getSupplierPerformance);

// Admin only: deactivate supplier
router.delete("/:id", validateObjectId("id"), authorize("admin"), deactivateSupplier);

export default router;
