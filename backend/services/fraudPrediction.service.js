import { callMLService } from "./mlClient.service.js";
import { classifyRisk } from "../utils/riskRules.js";
import { logFraudEvent } from "../utils/logger.js";

export async function predictFraud(userId, transactionId) {
    // 🔹 Call ML service
    const probabilityData = await callMLService({ upi_id: userId });
    const probability = probabilityData.fraudProbability;

    // 🔹 Apply rules
    const decision = classifyRisk(probability);

    // 🔹 Log decision
    logFraudEvent({
        userId,
        transactionId,
        riskLevel: decision.riskLevel,
        probability,
        allowed: decision.allowed
    });

    return {
        probability,
        ...decision
    };
}
