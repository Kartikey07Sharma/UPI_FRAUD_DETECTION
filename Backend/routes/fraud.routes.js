// routes/fraud.routes.js

import express from "express";
import { checkFraud } from "../controllers/fraud.controller.js";

const router = express.Router();

// Public route for simulator/testing
router.post("/check", checkFraud);

// Analytics route
router.get("/analytics", (req, res) => {
    res.json({
        success: true,
        barChartData: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
                {
                    label: "Total Transactions",
                    data: [120, 150, 180, 210, 240, 270],
                    backgroundColor: "hsl(189 94% 43% / 0.6)",
                },
                {
                    label: "Fraudulent",
                    data: [5, 8, 4, 12, 10, 15],
                    backgroundColor: "hsl(0 84% 60% / 0.6)",
                },
            ],
        },
        pieChartData: {
            labels: ["Safe", "Suspicious", "Flagged"],
            datasets: [
                {
                    data: [85, 10, 5],
                    backgroundColor: ["hsl(142 76% 36%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)"],
                },
            ],
        }
    });
});

export default router;
