import { createTransaction } from "../models/transaction.model.js";
import { triggerUserProfileUpdate } from "../services/userProfile.service.js";

export async function createTransactionController(req, res) {
    try {
        const transactionId = await createTransaction(req.body);

        // 🔥 VERY IMPORTANT STEP
        triggerUserProfileUpdate();

        res.status(201).json({
            success: true,
            transactionId,
            message: "Transaction saved & profile update triggered"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Transaction failed",
            error: error.message
        });
    }
}
