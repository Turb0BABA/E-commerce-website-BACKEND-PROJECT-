import express from "express";
import { protect, admin } from "../middleware/auth.js";

import {
  getSummary,
  getAllUsers,
  getLowStock,
  toggleUserStatus,
  getCategoryStats,
  getTopProducts,
  getMonthlyRevenue,
  getAdminStats
} from "../controllers/admin.controller.js";

import {
   getAllOrders,
   updateOrderStatus
} from "../controllers/order.controller.js";

const router = express.Router();

/* =====================================================
   ADMIN SUMMARY (used by dashboard)
===================================================== */
router.get("/summary", protect, admin, getSummary);

/* =====================================================
   USERS
===================================================== */
router.get("/users", protect, admin, getAllUsers);
router.put("/users/:id/toggle", protect, admin, toggleUserStatus);

/* =====================================================
   LOW STOCK ALERTS
===================================================== */
router.get("/low-stock", protect, admin, getLowStock);

//   ADMIN ORDERS
router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id", protect, admin, updateOrderStatus);

//   ADVANCED DASHBOARD APIs (optional)

router.get("/revenue", protect, admin, getMonthlyRevenue);
router.get("/top-products", protect, admin, getTopProducts);
router.get("/categories", protect, admin, getCategoryStats);
router.get("/stats", protect, admin, getAdminStats);

export default router;
