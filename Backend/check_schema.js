import { query } from "./config/db.js";

async function checkProfile() {
    try {
        const rows = await query("SELECT * FROM user_profiles WHERE upi_id = 'fraud1@upi'");
        console.log("User Profile:", JSON.stringify(rows[0], null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    }
    process.exit();
}

checkProfile();



