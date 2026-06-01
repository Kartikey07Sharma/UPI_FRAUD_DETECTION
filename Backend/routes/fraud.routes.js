import express from "express";
import { checkFraud, getAnalytics, getRandomUser } from "../controllers/fraud.controller.js";

const router = express.Router();

// Public route for simulator/testing
router.post("/check", checkFraud);

// Analytics route
router.get("/analytics", getAnalytics);

// Random user for simulator
router.get("/random-user", getRandomUser);

export default router;
