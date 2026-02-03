// utils/riskRules.js

export function classifyRisk(probability) {
    if (probability < 0.3) {
        return {
            riskLevel: "SAFE",
            action: "ALLOW"
        };
    }

    if (probability >= 0.3 && probability < 0.7) {
        return {
            riskLevel: "WARNING",
            action: "REVIEW"
        };
    }

    return {
        riskLevel: "BLOCK",
        action: "BLOCK"
    };
}
