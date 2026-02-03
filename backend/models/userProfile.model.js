import { query } from "../config/db.js";

/**
 * Get user profile by UPI ID
 * @param {string} upiId
 */
export async function getUserProfileByUpiId(upiId) {
    const sql = `
        SELECT *
        FROM user_profiles
        WHERE upi_id = ?
        LIMIT 1
    `;
    const rows = await query(sql, [upiId]);
    return rows.length ? rows[0] : null;
}

/**
 * Insert new user profile
 * @param {object} profile
 */
export async function insertUserProfile(profile) {
    const sql = `
        INSERT INTO user_profiles (
            upi_id,
            total_transactions,
            failed_transactions,
            avg_amount,
            total_amount,
            failure_rate,
            night_tx_ratio,
            refund_ratio,
            risky_location_ratio,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const params = [
        profile.upi_id,
        profile.total_transactions,
        profile.failed_transactions,
        profile.avg_amount,
        profile.total_amount,
        profile.failure_rate,
        profile.night_tx_ratio,
        profile.refund_ratio,
        profile.risky_location_ratio
    ];

    return await query(sql, params);
}

/**
 * Update existing user profile
 * @param {object} profile
 */
export async function updateUserProfile(profile) {
    const sql = `
        UPDATE user_profiles
        SET
            total_transactions = ?,
            failed_transactions = ?,
            avg_amount = ?,
            total_amount = ?,
            failure_rate = ?,
            night_tx_ratio = ?,
            refund_ratio = ?,
            risky_location_ratio = ?,
            updated_at = NOW()
        WHERE upi_id = ?
    `;

    const params = [
        profile.total_transactions,
        profile.failed_transactions,
        profile.avg_amount,
        profile.total_amount,
        profile.failure_rate,
        profile.night_tx_ratio,
        profile.refund_ratio,
        profile.risky_location_ratio,
        profile.upi_id
    ];

    return await query(sql, params);
}
