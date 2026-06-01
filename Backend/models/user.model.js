import { query } from "../config/db.js";

export async function createUser(name, email, hashedPassword) {
    const sql = `
        INSERT INTO users (full_name, email, password_hash)
        VALUES (?, ?, ?)
    `;
    return query(sql, [name, email, hashedPassword]);
}

export async function findUserByEmail(email) {
    const sql = `SELECT app_user_id, full_name, email, password_hash FROM users WHERE email = ?`;
    const rows = await query(sql, [email]);
    if (rows[0]) {
        // Map DB columns to what the controller expects
        return {
            id: rows[0].app_user_id,
            name: rows[0].full_name,
            email: rows[0].email,
            password: rows[0].password_hash
        };
    }
    return null;
}
