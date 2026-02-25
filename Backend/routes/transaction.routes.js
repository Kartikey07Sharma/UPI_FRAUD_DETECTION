import express from "express";
import { createTransactionController } from "../controllers/transaction.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router(); // ✅ Add this

// 🔐 Protected route
router.post("/", protect, createTransactionController);

export default router;
