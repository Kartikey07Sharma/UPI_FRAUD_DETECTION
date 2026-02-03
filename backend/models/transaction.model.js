import { query } from "../config/db.js";

export async function createTransaction(txn) {
    const sql = `
        INSERT INTO transactions (
            upi_id,
            tx_timestamp,
            amount,
            tx_status,
            is_refund,
            device_id,
            geo_location,
            upi_created_date
        )
        VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        txn.upi_id,
        txn.amount,
        txn.tx_status,
        txn.is_refund,
        txn.device_id,
        txn.geo_location,
        txn.upi_created_date
    ];

    const result = await query(sql, params);
    return result.insertId;
}
