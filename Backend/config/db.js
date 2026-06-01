import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let dbInstance = null;

async function getDb() {
    if (!dbInstance) {
        dbInstance = await mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Force a connection handshake to verify credentials
        const connection = await dbInstance.getConnection();
        console.log("✅ MySQL Connected Successfully");
        connection.release();
    }
    return dbInstance;
}

// Test Connection
getDb().catch(err => console.error(" MySQL Connection Failed:", err.message));

// ================================
// REUSABLE QUERY FUNCTION
// ================================
export async function query(sql, params = []) {
    const db = await getDb();
    const [rows, fields] = await db.query(sql, params);
    
    // Map back for consistency if needed, but mysql2 returns an array for SELECT
    // or an object for INSERT/UPDATE (result.insertId, result.affectedRows)
    return rows;
}

export default getDb;
