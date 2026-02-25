import mysql from "mysql2/promise";
import "dotenv/config";

// ================================
// MYSQL CONNECTION POOL
// ================================
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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
