import express from "express";

import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import fraudRoutes from "./routes/fraud.routes.js";

const app = express();

// ================================
// MIDDLEWARE
// ================================
app.use(express.json());

// ================================
// ROUTES
// ================================
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/fraud", fraudRoutes);

// ================================
// DEFAULT ROUTE
// ================================
app.get("/", (req, res) => {
    res.send("🚀 UPI Fraud Detection Backend is running");
});

export default app;
