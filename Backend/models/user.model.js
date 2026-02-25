import { query } from "../config/db.js";

export async function createUser(name, email, hashedPassword) {
    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;
    return query(sql, [name, email, hashedPassword]);
}

export async function findUserByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const rows = await query(sql, [email]);
    return rows[0];
}
