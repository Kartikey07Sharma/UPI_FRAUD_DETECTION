import { getFraudPrediction } from "./services/fraudPrediction.service.js"; // correct path

async function testML() {
    try {
        const dummyProfile = {}; // empty payload for fallback ML
        const result = await getFraudPrediction(dummyProfile);
        console.log("✅ ML server response:", result);
    } catch (error) {
        console.error("❌ ML server connection failed:", error.message);
    }
}

testML();
