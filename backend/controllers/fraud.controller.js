import { predictFraud } from "../services/fraudPrediction.service.js";
import * as FraudModel from "../models/fraud.model.js";

export async function checkFraud(req, res) {
    try {
        const { userId, transactionId } = req.body;

        if (!userId || !transactionId) {
            return res.status(400).json({
                message: "userId and transactionId are required"
            });
        }

        // 🔹 Call fraud prediction service
        const result = await predictFraud(userId, transactionId);

        // ✅ STEP 9: Send meaningful response to frontend
        return res.status(200).json({
            risk_level: result.riskLevel,
            fraud_probability: result.probability,
            message: result.message,
            allowed: result.allowed
        });

    } catch (error) {
        console.error("Fraud check error:", error.message);
        res.status(500).json({
            message: "Fraud check failed"
        });
    }
}

export async function getFraudStats(req, res) {
    try {
        const stats = await FraudModel.getStats();

        // Format for frontend
        const data = [
            { title: "Total Transactions", value: stats.total.toLocaleString(), icon: "Activity", color: "text-primary", bgColor: "bg-primary/20", change: "+12.5%" },
            { title: "Fraud Detected", value: stats.fraud.toLocaleString(), icon: "AlertTriangle", color: "text-destructive", bgColor: "bg-destructive/20", change: "+5.2%" },
            { title: "Manual Reviews", value: stats.review.toLocaleString(), icon: "CheckCircle", color: "text-success", bgColor: "bg-success/20", change: "-2.4%" },
            { title: "Security Score", value: "98.5%", icon: "TrendingUp", color: "text-warning", bgColor: "bg-warning/20", change: "+0.3%" }
        ];

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function getFraudHistory(req, res) {
    try {
        const history = await FraudModel.getHistory();
        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function getFraudAnalytics(req, res) {
    try {
        const trends = await FraudModel.getTrends();

        // Prepare chart data
        const barChartData = {
            labels: trends.map(t => t.month),
            datasets: [
                {
                    label: "Total Transactions",
                    data: trends.map(t => t.total),
                    backgroundColor: "hsl(189 94% 43% / 0.6)",
                    borderColor: "hsl(189 94% 43%)",
                    borderWidth: 2,
                },
                {
                    label: "Fraudulent",
                    data: trends.map(t => Math.floor(t.total * 0.05)), // Mocked 5%
                    backgroundColor: "hsl(0 84% 60% / 0.6)",
                    borderColor: "hsl(0 84% 60%)",
                    borderWidth: 2,
                },
            ],
        };

        const pieChartData = {
            labels: ["Safe", "Suspicious", "Flagged"],
            datasets: [
                {
                    data: [85, 10, 5],
                    backgroundColor: [
                        "hsl(142 76% 36%)",
                        "hsl(38 92% 50%)",
                        "hsl(0 84% 60%)",
                    ],
                    borderWidth: 2,
                    borderColor: "hsl(222 47% 11%)",
                },
            ],
        };

        res.json({ success: true, barChartData, pieChartData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function predictFraudController(req, res) {
    try {
        const { upi_id, amount, geo_location, device_id } = req.body;

        if (!upi_id) {
            return res.status(400).json({ success: false, message: "upi_id is required" });
        }

        // Call prediction service with the upi_id
        const result = await predictFraud(upi_id, `SIM-${Date.now()}`);

        res.json({
            success: true,
            prediction: {
                is_fraud: result.riskLevel === "BLOCK",
                fraud_probability: result.probability,
                risk_level: result.riskLevel,
                message: result.message
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
