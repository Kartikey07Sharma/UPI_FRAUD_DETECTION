import express from "express";
import { createTransactionController } from "../controllers/transaction.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 Protected route
router.post("/", authenticate, createTransactionController);

export default router;
