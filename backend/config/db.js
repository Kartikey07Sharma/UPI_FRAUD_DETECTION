import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// ================================
// MYSQL CONNECTION POOL
// ================================
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "upi_fraud_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// ================================
// TEST CONNECTION (runs once)
// ================================
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("✅ MySQL Connected Successfully");
        conn.release();
    } catch (err) {
        console.error("❌ MySQL Connection Failed:", err.message);
    }
})();

// ================================
// REUSABLE QUERY FUNCTION
// ================================
export async function query(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

export default pool;
