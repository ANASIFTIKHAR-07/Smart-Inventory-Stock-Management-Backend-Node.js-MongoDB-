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

router.use(protect);

router.get("/", getProducts);
router.get("/:id", validateObjectId("id"), getProductById);
router.post("/", authorize("admin", "staff"), createProduct);
router.put("/:id", validateObjectId("id"), authorize("admin", "staff"), updateProduct);
router.delete("/:id", validateObjectId("id"), authorize("admin"), deleteProduct);

export default router;
