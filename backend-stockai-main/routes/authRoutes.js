import express from "express";
import {
  signup,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  validateResetToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
// router.post("/supplier-signup", supplierSignup);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.post("/forgot-password", forgotPassword);
router.get("/validate-reset-token/:token", validateResetToken);
router.post("/reset-password/:token", resetPassword);

export default router;
