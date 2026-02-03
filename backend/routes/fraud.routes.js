// routes/fraud.routes.js

import express from "express";
import { checkFraud, getFraudStats, getFraudHistory, getFraudAnalytics, predictFraudController } from "../controllers/fraud.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes
router.post("/check", authenticate, checkFraud);
router.get("/stats", authenticate, getFraudStats);
router.get("/history", authenticate, getFraudHistory);
router.get("/analytics", authenticate, getFraudAnalytics);
router.post("/predict", authenticate, predictFraudController);

export default router;
