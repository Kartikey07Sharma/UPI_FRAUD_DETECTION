import fetch from "node-fetch";

/**
 * Calls Python ML service to get fraud prediction
 */
export async function callMLService(userProfile) {
    try {
        console.log("Calling ML Service: http://127.0.0.1:8000/predict");
        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userProfile)
        });

        if (!response.ok) {
            console.error(`ML Service Error Details: ${response.status} ${response.statusText}`);
            throw new Error(`ML service error: ${response.status}`);
        }


        const result = await response.json();

        return {
            fraudProbability: result.fraud_probability,
            label: result.label
        };

    } catch (error) {
        console.error("❌ ML Service Error:", error.message);
        throw error;
    }
}
