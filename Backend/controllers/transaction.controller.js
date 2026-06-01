import fetch from "node-fetch";
import { createTransaction, createTransactionsBatch } from "../models/transaction.model.js";
import { triggerUserProfileUpdate } from "../services/userProfile.service.js";
import { getUserProfilesByUpiIds } from "../models/userProfile.model.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

export async function createTransactionController(req, res) {
    try {
        const { upi_id, amount, tx_status, is_refund, device_id, geo_location, upi_created_date } = req.body;

        // 1. Save transaction to MySQL
        const transactionId = await createTransaction({
            upi_id,
            amount,
            tx_status: tx_status || 'success',
            is_refund: is_refund || 0,
            device_id,
            geo_location,
            upi_created_date
        });

        // 2. Trigger real User Profile recalculation
        // We await it here so the response confirms sync, but you could also do it in background
        await triggerUserProfileUpdate([upi_id]);

        res.status(201).json({
            success: true,
            transactionId,
            message: "Real-time transaction recorded and profile sync completed."
        });

    } catch (error) {
        console.error(" Transaction Recording Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to record transaction in MySQL",
            error: error.message
        });
    }
}

export const uploadCSVController = async (req, res) => {
    let finalStatus = "SAFE";
    let riskScore = 0;
    let mlPredictionSuccessful = false;
    let mlMessage = "ML prediction not attempted.";

    try {
        console.log(" Starting CSV upload process...");

        if (!req.file) {
            console.log(" No CSV file uploaded.");
            return res.status(400).json({ success: false, message: "No CSV file uploaded." });
        }
        console.log(` Received file: ${req.file.originalname}, size: ${req.file.size} bytes.`);

        const transactions = [];
        const upiIds = new Set();

        const csvContent = req.file.buffer.toString();
        const stream = Readable.from(csvContent);

        // ─── STEP 1: Parse CSV ───────────────────────────────────────────
        console.log(" Step 1: Parsing CSV content...");
        await new Promise((resolve, reject) => {
            stream.pipe(csvParser())
                .on("data", (row) => {
                    const normalizedRow = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.trim().replace(/^\uFEFF/, "")] = typeof row[key] === "string" ? row[key].trim() : row[key];
                    });
                    transactions.push(normalizedRow);
                    if (normalizedRow.upi_id) upiIds.add(normalizedRow.upi_id);
                })
                .on("end", () => {
                    console.log(` Step 1 done: Parsed ${transactions.length} rows, ${upiIds.size} unique users.`);
                    resolve();
                })
                .on("error", (err) => {
                    console.error(" CSV parsing error:", err.message);
                    reject(err);
                });
        });

        if (transactions.length === 0) {
            console.log(" CSV file is empty or invalid after parsing.");
            return res.status(400).json({ success: false, message: "CSV file is empty or invalid." });
        }

        console.log(` Processing CSV: ${transactions.length} rows, ${upiIds.size} unique users.`);

        // ─── STEP 2: Bulk Insert into Database ───────────────────────────
        console.log(" Step 2: Bulk inserting transactions into database...");
        await createTransactionsBatch(transactions);
        console.log(" Step 2 done: Transactions bulk inserted successfully.");

        // ─── STEP 3: Trigger Profile Updates (with 45s timeout) ──────────
        console.log(" Step 3: Triggering user profile updates...");
        const profileUpdateTimeoutMs = 45000;
        try {
            await Promise.race([
                triggerUserProfileUpdate(Array.from(upiIds)),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Profile update timed out after ${profileUpdateTimeoutMs / 1000}s`)), profileUpdateTimeoutMs)
                )
            ]);
            console.log(" Step 3 done: User profiles updated successfully.");
        } catch (profileErr) {
            console.warn(` Step 3 warning: ${profileErr.message}. Continuing anyway.`);
        }

        // ─── STEP 4: Fetch profiles for ML ───────────────────────────────
        console.log(" Step 4: Fetching user profiles for ML prediction...");
        const profiles = await getUserProfilesByUpiIds(Array.from(upiIds));
        console.log(` Step 4 done: ${profiles.length} profiles fetched.`);

        if (profiles.length === 0) {
            console.warn(" No user profiles found — returning SAFE fallback.");
            return res.status(200).json({
                success: true,
                message: "Transactions recorded, but no user profiles available for prediction.",
                rowCount: transactions.length,
                predictions: [],
                status: "SAFE",
                risk_score: 0
            });
        }

        // ─── STEP 5: Prepare & call ML Batch API ─────────────────────────
        const ML_BATCH_URL = (process.env.ML_BATCH_URL || "").trim() || "http://localhost:8000/predict-batch";

        // Cap to max 100 profiles to keep ML response fast
        const MAX_ML_BATCH = 100;
        const sampledProfiles = profiles.length > MAX_ML_BATCH
            ? profiles.sort(() => Math.random() - 0.5).slice(0, MAX_ML_BATCH)
            : profiles;

        console.log(` Step 5: Calling ML → ${ML_BATCH_URL} with ${sampledProfiles.length}/${profiles.length} profiles`);

        const batchItems = sampledProfiles.map(profile => ({
            userId: profile.upi_id,
            transactionId: `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            features: [
                profile.account_age_days,
                profile.days_active,
                profile.txn_count_day,
                profile.avg_txn_amount,
                profile.failed_txn_ratio,
                profile.refund_ratio,
                profile.device_switch_ratio,
                profile.geo_switch_ratio,
                profile.avg_txn_time_gap
            ]
        }));

        let mlData = null;
        const mlApiTimeoutMs = 60000;  // 60s

        try {
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), mlApiTimeoutMs);

            const mlResponse = await fetch(ML_BATCH_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: batchItems }),
                signal: abortController.signal
            });
            clearTimeout(timeoutId);

            if (!mlResponse.ok) {
                const errText = await mlResponse.text();
                throw new Error(`ML returned HTTP ${mlResponse.status}: ${errText}`);
            }

            mlData = await mlResponse.json();
            mlPredictionSuccessful = true;
            const sampleNote = profiles.length > MAX_ML_BATCH
                ? ` (sampled ${MAX_ML_BATCH} of ${profiles.length} users)`
                : "";
            mlMessage = `ML prediction successful${sampleNote}.`;
            console.log(` Step 5 done: ML responded with ${mlData?.predictions?.length ?? 0} predictions.`);
        } catch (mlErr) {
            console.error(` Step 5 ML call failed (fallback to SAFE): ${mlErr.message}`);
            mlMessage = `ML prediction failed: ${mlErr.message}`;
        }

        // ─── STEP 6: Build Final Response ────────────────────────────────
        console.log(" Step 6: Building final response...");

        const predictions = (mlPredictionSuccessful && mlData?.predictions) ? mlData.predictions : [];

        if (predictions.length > 0) {
            const probs = predictions.map(p => p.fraud_probability);
            const maxProb = Math.max(...probs);

            if (maxProb > 0.7) finalStatus = "FRAUD";
            else if (maxProb > 0.4) finalStatus = "SUSPICIOUS";
            else finalStatus = "SAFE";

            riskScore = Math.round(maxProb * 100);
            console.log(` Step 6 done: maxProb=${maxProb.toFixed(3)}, status=${finalStatus}, risk_score=${riskScore}`);
        } else {
            console.warn(" Step 6: No ML predictions — defaulting to SAFE.");
            finalStatus = "SAFE";
            riskScore = 0;
        }

        //  FINAL RESPONSE
        return res.status(200).json({
            success: true,
            message: "Batch Analysis Complete",
            ml_message: mlMessage,
            status: finalStatus,
            risk_score: riskScore,
            rowCount: transactions.length,
            predictions: predictions
        });

    } catch (error) {
        console.error(" CSV Upload Fatal Error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Failed to process CSV file.",
                error: error.message,
                status: "ERROR",
                risk_score: 0,
                rowCount: 0,
                predictions: []
            });
        }
    }
};
