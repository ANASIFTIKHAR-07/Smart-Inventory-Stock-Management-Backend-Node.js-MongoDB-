import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Read: any authenticated user (admin, staff, supplier)
router.get("/", getProducts);
router.get("/:id", validateObjectId("id"), getProductById);

// Write: admin or staff only
router.post("/", authorize("admin", "staff"), createProduct);
router.put("/:id", validateObjectId("id"), authorize("admin", "staff"), updateProduct);

// Delete: admin only
router.delete("/:id", validateObjectId("id"), authorize("admin"), deleteProduct);

export default router;
