import express from "express";
import { protect, admin } from "../middleware/auth.js";
import {
  placeOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder   // ⬅ ADD THIS
} from "../controllers/order.controller.js";

const router = express.Router();

// User routes
router.post("/", protect, placeOrder);
router.get("/", protect, getUserOrders);
router.get("/:id", protect, getOrderById);

// Admin routes
router.get("/admin/all", protect, admin, getAllOrders);
router.put("/admin/:id", protect, admin, updateOrderStatus);

router.put("/cancel/:id", protect, cancelOrder);

export default router;
