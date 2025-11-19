import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// All cart routes require logged-in user
router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem);
router.delete("/item/:productId", protect, removeCartItem);
router.delete("/clear", protect, clearCart);  

export default router;
