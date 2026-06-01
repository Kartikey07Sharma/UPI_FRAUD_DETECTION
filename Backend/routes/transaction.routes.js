import express from "express";
import multer from "multer";
import { createTransactionController, uploadCSVController } from "../controllers/transaction.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router(); 

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//  Protected route
router.post("/", protect, createTransactionController);

// CSV Upload route
router.post("/upload", upload.single("file"), uploadCSVController);

export default router;
