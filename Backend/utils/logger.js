import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

// Create logs folder if not exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "fraud.log");

export function logFraudEvent(data) {
    const logEntry = `
[${new Date().toISOString()}]
User ID: ${data.userId}
Transaction ID: ${data.transactionId}
Risk Level: ${data.riskLevel}
Probability: ${data.probability}
Allowed: ${data.allowed}
---------------------------------------
`;

    fs.appendFileSync(logFile, logEntry);
}
