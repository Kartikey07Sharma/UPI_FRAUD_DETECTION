import { classifyRisk } from "../utils/riskRules.js";
import { logFraudEvent } from "../utils/logger.js";

/**
 * Calls Python ML service to get fraud prediction
 * Expects an object with transaction details
 */
export async function getFraudPrediction(predictionData) {
    try {
        const response = await fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(predictionData) // send full object
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`ML service responded with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        console.log("🤖 ML Server raw response:", data);
        return data.fraud_probability;
    } catch (error) {
        console.error("Error calling ML service:", error);
        // In a real application, you might want to implement a fallback or
        // return a default risk level here.
        throw error;
    }
}

export async function predictFraud(userId, transactionId, transactionData = {}) {
    // Call ML service with full object including transaction details
    const probability = await getFraudPrediction({
        userId,
        transactionId,
        ...transactionData
    });

    // Apply rules
    const decision = classifyRisk(probability);

    // Log decision
    logFraudEvent({
        userId,
        transactionId,
        riskLevel: decision.riskLevel,
        probability,
        allowed: decision.allowed
    });

    const result = {
        probability,
        ...decision
    };
    console.log("✅ Final result from predictFraud:", result);
    return result;
}
