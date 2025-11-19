import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { protect, admin } from "../middleware/auth.js";
import { getAllUsers } from "../controllers/admin.controller.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin: get all users
router.get("/all", protect, admin, getAllUsers);

export default router;
