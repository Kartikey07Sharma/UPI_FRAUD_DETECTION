import fetch from 'node-fetch';

async function testML() {
    const url = "http://127.0.0.1:8000/predict";
    console.log("Testing connection to:", url);
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "test", transactionId: "test", amount: 100 })
        });
        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Connection failed:", e.message);
    }
}

testML();
