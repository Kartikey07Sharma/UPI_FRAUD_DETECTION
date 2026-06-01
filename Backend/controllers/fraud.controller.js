import { predictFraud } from "../services/fraudPrediction.service.js";

import { getUserProfileByUpiId, getRandomUserProfile } from "../models/userProfile.model.js";
import { query } from "../config/db.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Analytics controller
export const getAnalytics = async (req, res) => {
    try {
        // 1. Get Monthly Stats for Bar Chart (Last 6 months)
        const barDataRows = await query(`
            SELECT 
                DATE_FORMAT(tx_timestamp, '%b') as label, 
                COUNT(*) as total, 
                SUM(is_fraud_txn) as fraudulent
            FROM transactions
            WHERE tx_timestamp >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(tx_timestamp, '%m'), label
            ORDER BY DATE_FORMAT(tx_timestamp, '%m')
        `);

        const barChartData = {
            labels: barDataRows.map(r => r.label),
            datasets: [
                {
                    label: "Total Transactions",
                    data: barDataRows.map(r => Number(r.total)),
                    backgroundColor: "hsl(189 94% 43% / 0.6)",
                    borderColor: "hsl(189 94% 43%)",
                    borderWidth: 2,
                },
                {
                    label: "Fraudulent",
                    data: barDataRows.map(r => Number(r.fraudulent)),
                    backgroundColor: "hsl(0 84% 60% / 0.6)",
                    borderColor: "hsl(0 84% 60%)",
                    borderWidth: 2,
                },
            ],
        };

        // 2. Get Distribution for Pie Chart
        const pieDataRows = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(IF(fraud_probability >= 0.7, 1, 0)) as flagged,
                SUM(IF(fraud_probability >= 0.4 AND fraud_probability < 0.7, 1, 0)) as suspicious
            FROM fraud_alerts
        `);

        let safe = 0, suspicious = 0, flagged = 0;
        if (pieDataRows.length > 0 && pieDataRows[0].total > 0) {
            flagged = Number(pieDataRows[0].flagged) || 0;
            suspicious = Number(pieDataRows[0].suspicious) || 0;
            safe = Number(pieDataRows[0].total) - flagged - suspicious;
        } else {
            const fallbackRows = await query(`SELECT COUNT(*) as total, SUM(is_fraud_txn) as flagged FROM transactions`);
            const totalFallback = Number(fallbackRows[0]?.total) || 0;
            flagged = Number(fallbackRows[0]?.flagged) || 0;
            safe = totalFallback - flagged;
        }

        const pieChartData = {
            labels: ["Safe", "Suspicious", "Flagged"],
            datasets: [
                {
                    data: [safe, suspicious, flagged],
                    backgroundColor: ["hsl(142 76% 36%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)"],
                    borderWidth: 2,
                    borderColor: "hsl(222 47% 11%)",
                },
            ],
        };

        // 2b. Get Trends for Line Chart (Last 30 days)
        const lineDataRows = await query(`
            SELECT 
                DATE_FORMAT(tx_timestamp, '%d %b') as label, 
                SUM(is_fraud_txn) as fraud_count
            FROM transactions
            WHERE tx_timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE_FORMAT(tx_timestamp, '%Y-%m-%d'), label
            ORDER BY DATE_FORMAT(tx_timestamp, '%Y-%m-%d')
        `);

        const lineChartData = {
            labels: lineDataRows.map(r => r.label),
            datasets: [
                {
                    label: "Fraud Trend",
                    data: lineDataRows.map(r => Number(r.fraud_count)),
                    borderColor: "hsl(271 91% 65%)",
                    backgroundColor: "hsl(271 91% 65% / 0.1)",
                    tension: 0.4,
                    fill: true,
                },
            ],
        };

        // 3. Get 5 Most Recent Transactions
        const recentTransactions = await query(`
            SELECT 
                t.tx_id as id, 
                t.upi_id as sender, 
                'Merchant' as receiver, 
                t.amount, 
                DATE_FORMAT(t.tx_timestamp, '%H:%i') as time,
                CASE 
                    WHEN t.is_fraud_txn = 1 OR a.fraud_probability >= 0.7 THEN 'flagged'
                    WHEN a.fraud_probability >= 0.4 THEN 'suspicious'
                    ELSE 'safe'
                END as status
            FROM transactions t
            LEFT JOIN (
                SELECT upi_id, MAX(fraud_probability) as fraud_probability 
                FROM fraud_alerts 
                GROUP BY upi_id
            ) a ON t.upi_id = a.upi_id
            ORDER BY t.tx_timestamp DESC
            LIMIT 5
        `);

        // 4. Get ML Model Metrics from JSON
        let modelMetrics = null;
        try {
            const metricsPath = path.join(__dirname, "../..", "ml_pipeline", "model_metrics.json");
            const metricsData = await fs.readFile(metricsPath, "utf-8");
            modelMetrics = JSON.parse(metricsData);
        } catch (err) {
            console.warn(" Could not read model metrics:", err.message);
        }

        res.json({
            success: true,
            barChartData,
            lineChartData,
            pieChartData,
            recentTransactions,
            modelMetrics
        });
    } catch (error) {
        console.error(" Analytics Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch real analytics" });
    }
};

// 🔹 Real controller endpoint
export const checkFraud = async (req, res) => {
    console.log(" [DEBUG] Start checkFraud:", req.body);
    try {
        const { senderId, amount, device_id, geo_location, upi_created_date } = req.body;

        if (!senderId) {
            console.log(" [DEBUG] Missing senderId");
            return res.status(400).json({ success: false, message: "senderId is required" });
        }

        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        console.log(" [DEBUG] Generated TransactionID:", transactionId);

        let dbTxId = null;
        console.log(" [DEBUG] Pre-recording transaction...");
        try {
            const { createTransaction } = await import("../models/transaction.model.js");
            dbTxId = await createTransaction({
                upi_id: senderId,
                amount: amount || 0,
                tx_status: 'PENDING',
                is_refund: 0,
                device_id: device_id || 'UNKNOWN',
                geo_location: geo_location || 'UNKNOWN',
                upi_created_date: upi_created_date || null
            });
            console.log(" [DEBUG] Transaction pre-recorded with DB ID:", dbTxId);
        } catch (dbErr) {
            console.warn(" [DEBUG] Could not pre-record transaction:", dbErr.message);
        }

        console.log(" [DEBUG] Fetching profile for:", senderId);
        const profile = await getUserProfileByUpiId(senderId);
        console.log(" [DEBUG] Profile fetched:", profile ? "Found" : "New User");
        
        let mlFeatures = {
            account_age_days: 0,
            days_active: 0,
            txn_count_day: 0,
            avg_txn_amount: amount || 0,
            failed_txn_ratio: 0,
            refund_ratio: 0,
            device_switch_ratio: 0,
            geo_switch_ratio: 0,
            avg_txn_time_gap: 0
        };

        if (profile) {
            mlFeatures = {
                account_age_days: profile.account_age_days,
                days_active: profile.days_active,
                txn_count_day: profile.txn_count_day,
                avg_txn_amount: profile.avg_txn_amount,
                failed_txn_ratio: profile.failed_txn_ratio,
                refund_ratio: profile.refund_ratio,
                device_switch_ratio: profile.device_switch_ratio,
                geo_switch_ratio: profile.geo_switch_ratio,
                avg_txn_time_gap: profile.avg_txn_time_gap
            };
        } else {
            // New user or missing profile, let's trigger update so ML service can read it
            console.log(" [DEBUG] Triggering profile update for new user...");
            try {
                const { triggerUserProfileUpdate } = await import("../services/userProfile.service.js");
                await triggerUserProfileUpdate([senderId]);
            } catch (err) {
                console.warn(" [DEBUG] Could not update profile for new user:", err.message);
            }
        }

        console.log(" [DEBUG] Prepared ML Features:", JSON.stringify(mlFeatures, null, 2));

        console.log(" [DEBUG] Calling predictFraud...");
        const result = await predictFraud(senderId, transactionId, mlFeatures);
        console.log(" [DEBUG] predictFraud result:", JSON.stringify(result, null, 2));

        if (dbTxId) {
            console.log(" [DEBUG] Updating transaction fraud status for ID:", dbTxId);
            try {
                const { updateTransactionFraudStatus } = await import("../models/transaction.model.js");
                await updateTransactionFraudStatus(dbTxId, result.riskLevel !== "SAFE", result.probability);
                console.log(" [DEBUG] Transaction status updated");
            } catch (dbErr) {
                console.warn(" [DEBUG] Could not update transaction fraud status:", dbErr.message);
            }
        }

        console.log(" [DEBUG] Sending final response");
        return res.status(200).json({
            success: true,
            transactionId,
            risk_level: result.riskLevel,
            fraud_probability: result.probability,
            message: result.message || "Assessment complete",
            allowed: result.allowed
        });

    } catch (error) {
        console.error(" [DEBUG] Fraud check error:", error.message);
        console.error(" [DEBUG] Error stack:", error.stack);
        res.status(500).json({ success: false, message: "Internal Server Error in Fraud Assessment" });
    }
};

export const getRandomUser = async (req, res) => {
    try {
        const profile = await getRandomUserProfile();
        if (!profile) {
            return res.status(404).json({ success: false, message: "No users found" });
        }
        res.json({ success: true, upi_id: profile.upi_id });
    } catch (error) {
        console.error(" Get Random User Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

