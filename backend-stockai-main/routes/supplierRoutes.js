import express from "express";
import { protect } from "../middleware/authMiddleware.js";
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

// Apply authentication middleware
router.use(protect);

router.post("/", createSupplier);
router.get("/", getSuppliers);
// Specific routes MUST come before dynamic ":id" routes
router.get("/performance", getSuppliersPerformance);
router.get("/:id", getSupplierById);
router.put("/:id", updateSupplier);
router.delete("/:id", deactivateSupplier);
router.get("/:id/performance", getSupplierPerformance);

export default router;
