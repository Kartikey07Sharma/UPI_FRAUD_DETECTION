// utils/riskRules.js

export function classifyRisk(probability) {
    if (probability < 0.3) {
        return { riskLevel: "SAFE", allowed: true };
    }

    if (probability >= 0.3 && probability < 0.7) {
        return { riskLevel: "WARNING", allowed: false };
    }

    return { riskLevel: "BLOCK", allowed: false };
}
