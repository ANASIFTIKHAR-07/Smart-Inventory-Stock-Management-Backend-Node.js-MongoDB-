import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getStockSummary,
  getTopProducts,
  getRecentMovements,
  getProductStockReport,
  getSupplierStockReport,
  getPurchaseOrderReport,
  getLowStockReport
} from "../controllers/reportsController.js";
import { getMonthlyReport } from "../controllers/reportsController.js";

const router = express.Router();

// ✅ Apply middleware once for all routes
router.use(protect);

router.get("/stock-summary", getStockSummary);
router.get("/top-products", getTopProducts);
router.get("/recent-movements", getRecentMovements);
router.get("/products", getProductStockReport);
router.get("/supplier", getSupplierStockReport);
router.get("/purchase-orders", getPurchaseOrderReport);
// Low Stock Alert Report
router.get("/low-stock", getLowStockReport);
// Monthly report (JSON/PDF)
router.get("/monthly", getMonthlyReport);

export default router;
