import express from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

import upload from "../middleware/upload.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Create Product (Admin only)
router.post("/", protect, admin, upload.single("image"), addProduct);

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

// Update product
router.put("/:id", protect, admin, upload.single("image"), updateProduct);

// Delete product
router.delete("/:id", protect, admin, deleteProduct);

export default router;
