import pool from "./config/db.js";

async function testDB() {
    try {
        const [rows] = await pool.query("SELECT 1 + 1 AS result");
        console.log("✅ DB connected successfully");
        console.log("Result:", rows[0].result);
        process.exit(0);
    } catch (error) {
        console.error("❌ DB connection failed");
        console.error(error.message);
        process.exit(1);
    }
}

testDB();
