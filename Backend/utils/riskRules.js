export function classifyRisk(probability) {

    if (probability < 0.4) {
        return { riskLevel: "SAFE", allowed: true };
    }

    if (probability >= 0.4 && probability < 0.7) {
        return { riskLevel: "SUSPICIOUS", allowed: false };
    }

    return { riskLevel: "FRAUD", allowed: false };
}