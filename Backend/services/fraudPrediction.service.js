import fetch from "node-fetch";
import { classifyRisk } from "../utils/riskRules.js";
import { logFraudEvent } from "../utils/logger.js";

/**
 * Calls Python ML service to get fraud prediction
 * Expects an object with transaction details
 */
export async function getFraudPrediction(predictionData) {
    const ML_URL = (process.env.ML_SERVICE_URL || "").trim() || "http://localhost:8000/predict";

    try {
        const { 
            account_age_days, days_active, txn_count_day, avg_txn_amount, 
            failed_txn_ratio, refund_ratio, device_switch_ratio, 
            geo_switch_ratio, avg_txn_time_gap 
        } = predictionData;

        const features = [
            account_age_days, days_active, txn_count_day, avg_txn_amount,
            failed_txn_ratio, refund_ratio, device_switch_ratio,
            geo_switch_ratio, avg_txn_time_gap
        ];

        const response = await fetch(ML_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: predictionData.userId,
                transactionId: predictionData.transactionId,
                features: features
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(` ML service error (${response.status}):`, errorBody);
            throw new Error(`ML service responded with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        console.log(" ML Server Raw Response Object:", JSON.stringify(data, null, 2));
        console.log(" Extracted Fraud Probability:", data.fraud_probability);
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
    console.log(" Final result from predictFraud:", result);
    return result;
}
