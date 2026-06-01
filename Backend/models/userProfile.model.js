import { query } from "../config/db.js";

/**
 * Get multiple user profiles by UPI IDs
 * @param {string[]} upiIds
 */
export async function getUserProfilesByUpiIds(upiIds) {
    if (!upiIds || upiIds.length === 0) return [];
    const sql = `
        SELECT *
        FROM user_profiles
        WHERE upi_id IN (?)
    `;
    // mysql2 handles array in (?) automatically
    return await query(sql, [upiIds]);
}

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
 * Insert or Update user profile (Upsert)
 * @param {object} profile
 */
export async function upsertUserProfile(profile) {
    const sql = `
        INSERT INTO user_profiles (
            upi_id,
            account_age_days,
            days_active,
            txn_count_day,
            avg_txn_amount,
            failed_txn_ratio,
            refund_ratio,
            device_switch_ratio,
            geo_switch_ratio,
            avg_txn_time_gap,
            is_fraud,
            last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            account_age_days = VALUES(account_age_days),
            days_active = VALUES(days_active),
            txn_count_day = VALUES(txn_count_day),
            avg_txn_amount = VALUES(avg_txn_amount),
            failed_txn_ratio = VALUES(failed_txn_ratio),
            refund_ratio = VALUES(refund_ratio),
            device_switch_ratio = VALUES(device_switch_ratio),
            geo_switch_ratio = VALUES(geo_switch_ratio),
            avg_txn_time_gap = VALUES(avg_txn_time_gap),
            is_fraud = VALUES(is_fraud),
            last_updated = NOW()
    `;

    const params = [
        profile.upi_id,
        profile.account_age_days,
        profile.days_active,
        profile.txn_count_day,
        profile.avg_txn_amount,
        profile.failed_txn_ratio,
        profile.refund_ratio,
        profile.device_switch_ratio,
        profile.geo_switch_ratio,
        profile.avg_txn_time_gap,
        profile.is_fraud
    ];

    return await query(sql, params);
}

/**
 * Get a random user profile from the database
 */
export async function getRandomUserProfile() {
    const sql = `
        SELECT *
        FROM user_profiles
        ORDER BY RAND()
        LIMIT 1
    `;
    const rows = await query(sql);
    return rows.length ? rows[0] : null;
}
