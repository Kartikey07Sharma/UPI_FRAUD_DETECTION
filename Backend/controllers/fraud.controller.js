import { predictFraud } from "../services/fraudPrediction.service.js";

// 🔹 Real controller endpoint
export const checkFraud = async (req, res) => {
    console.log("📨 Received fraud check request:", req.body);
    try {
        const { senderId, receiverId, amount } = req.body;

        // Note: The service expects userId and transactionId, 
        // but the frontend sends senderId, receiverId, amount.
        // For now, let's pass what the service expects or adapt it.
        // Let's use senderId as userId for the simulation.
        const userId = senderId || "anonymous";
        const transactionId = `TXN-${Date.now()}`;

        if (!userId) {
            return res.status(400).json({ message: "senderId is required" });
        }

        const result = await predictFraud(userId, transactionId, req.body);
        console.log("✅ Final result from predictFraud:", result);

        return res.status(200).json({
            transactionId,
            risk_level: result.riskLevel || "UNKNOWN",
            fraud_probability: result.probability || 0,
            message: result.message || "",
            allowed: result.allowed !== undefined ? result.allowed : true
        });

    } catch (error) {
        console.error("Fraud check error:", error.message);
        res.status(500).json({ message: "Fraud check failed" });
    }
};
