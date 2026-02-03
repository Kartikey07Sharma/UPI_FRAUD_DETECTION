import { query } from "../config/db.js";

/**
 * Get basic statistics for fraud dashboard
 */
export async function getStats() {
    const totalTxnSql = `SELECT COUNT(*) as count FROM transactions`;
    const fraudTxnSql = `SELECT COUNT(*) as count FROM fraud_alerts WHERE fraud_probability > 0.7`;
    const reviewTxnSql = `SELECT COUNT(*) as count FROM fraud_alerts WHERE fraud_probability BETWEEN 0.3 AND 0.7`;

    const [total] = await query(totalTxnSql);
    const [fraud] = await query(fraudTxnSql);
    const [review] = await query(reviewTxnSql);

    return {
        total: total.count,
        fraud: fraud.count,
        review: review.count,
        activeSensors: 24 // Mocked
    };
}

/**
 * Get recent fraud check history
 */
export async function getHistory(limit = 10) {
    const sql = `
        SELECT alert_id as id, upi_id, fraud_probability, alert_time as time
        FROM fraud_alerts
        ORDER BY alert_time DESC
        LIMIT ?
    `;
    const rows = await query(sql, [limit]);
    return rows.map(row => ({
        ...row,
        status: row.fraud_probability > 0.7 ? "flagged" : row.fraud_probability > 0.3 ? "suspicious" : "safe"
    }));
}

/**
 * Get trend data for analytics
 */
export async function getTrends() {
    // This is more complex, for now returning mocked structure based on existing transactions
    const sql = `
        SELECT DATE_FORMAT(tx_timestamp, '%Y-%m') as month, COUNT(*) as total
        FROM transactions
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6
    `;
    const rows = await query(sql);
    return rows.reverse();
}
