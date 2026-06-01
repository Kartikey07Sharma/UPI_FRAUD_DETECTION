import { query } from "../config/db.js";

/**
 * Insert multiple transactions in batch
 * @param {object[]} transactions
 */
export async function createTransactionsBatch(transactions) {
    if (!transactions || transactions.length === 0) return 0;
    
    const sql = `
        INSERT INTO transactions (
            upi_id,
            amount,
            tx_status,
            is_refund,
            device_id,
            geo_location,
            upi_created_date,
            tx_timestamp,
            is_fraud_txn
        )
        VALUES ?
    `;

    const values = transactions.map(txn => [
        txn.upi_id,
        txn.amount,
        txn.tx_status || 'success',
        txn.is_refund || 0,
        txn.device_id,
        txn.geo_location,
        txn.upi_created_date,
        txn.tx_timestamp || new Date().toISOString().slice(0, 19).replace('T', ' '),
        txn.is_fraud_txn || 0
    ]);

    const result = await query(sql, [values]);
    return result.affectedRows;
}

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
        VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)
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

export async function updateTransactionFraudStatus(txnId, isFraud, fraudScore) {
    const sql = `
        UPDATE transactions
        SET is_fraud_txn = ?, tx_status = 'success'
        WHERE tx_id = ?
    `;
    return await query(sql, [isFraud ? 1 : 0, txnId]);
}
