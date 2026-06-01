import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dice5, Send, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { predictFraudAPI, uploadTransactionsCSV, getRandomUserAPI } from "@/services/api";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

export default function TransactionSimulator() {
    const [formData, setFormData] = useState({
        senderId: "",
        receiverId: "",
        amount: "",
    });

    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Batch results
    const [batchResults, setBatchResults] = useState(null);

    const [csvFile, setCsvFile] = useState(null);
    const [isCsvUploading, setIsCsvUploading] = useState(false);

    const generateRandomTransaction = async () => {
        try {
            const response = await getRandomUserAPI();
            const randomReceivers = ["merchant@upi", "shop@upi", "friend@upi", "charity@upi"];
            
            setFormData({
                senderId: response.data.upi_id,
                receiverId: randomReceivers[Math.floor(Math.random() * randomReceivers.length)],
                amount: String(Math.floor(Math.random() * 50000) + 100),
            });
            toast.info("Generated transaction for real user: " + response.data.upi_id);
        } catch (error) {
            console.error("Failed to fetch random user:", error);
            // Fallback
            const randomSenders = ["user123@upi", "john.doe@upi", "alice@upi", "bob.smith@upi"];
            const randomReceivers = ["merchant@upi", "shop@upi", "friend@upi", "charity@upi"];
    
            setFormData({
                senderId: randomSenders[Math.floor(Math.random() * randomSenders.length)],
                receiverId: randomReceivers[Math.floor(Math.random() * randomReceivers.length)],
                amount: String(Math.floor(Math.random() * 50000) + 100),
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await predictFraudAPI(formData);
            const data = response.data;

            if (data.require_csv) {
                // Existing user - show requirement for CSV
                setResult({
                    status: "history_required",
                    reason: data.message,
                    details: {
                        senderId: formData.senderId,
                        receiverId: formData.receiverId,
                        amount: `₹${parseFloat(formData.amount).toLocaleString('en-IN')}`
                    }
                });
                toast.info("Transaction History Required");
                } else {
                // New user - standard prediction
                const riskLevel = data.risk_level?.toLowerCase() || "safe";
                setResult({
                    transactionId: data.transactionId,
                    status: riskLevel, // "safe", "suspicious", or "fraud"
                    riskScore: Math.round(data.fraud_probability * 100),
                    reason: data.message || (riskLevel === "safe" ? "This transaction appears normal based on historical patterns." : "Risk patterns detected. Transaction assessment complete."),
                    details: {
                        senderId: formData.senderId,
                        receiverId: formData.receiverId,
                        amount: `₹${parseFloat(formData.amount).toLocaleString('en-IN')}`
                    }
                });
                toast.success("Analysis Complete");
            }

        } catch (error) {
            console.error("Simulation Error:", error);
            toast.error("Analysis Failed", {
                description: error.response?.data?.message || "Failed to connect to fraud detection service"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            senderId: "",
            receiverId: "",
            amount: "",
        });
        setResult(null);
        setBatchResults(null);
    };

    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            toast.error("Please select a CSV file to upload");
            return;
        }

        setIsCsvUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append("file", csvFile);

        try {
            const response = await uploadTransactionsCSV(formDataUpload);
            const data = response.data;

            if (data.success) {
                const rowCount = data.rowCount ?? 0;
                const status = (data.status || "SAFE").toLowerCase();
                const riskScore = data.risk_score ?? 0;

                toast.success(`Successfully uploaded and analysed ${rowCount} transactions.`);
                setCsvFile(null);

                // Clear any stale single-transaction result
                setResult(null);

                // Set the batch summary into the result card
                setResult({
                    status: status,           // "safe" | "suspicious" | "fraud"
                    riskScore: riskScore,
                    reason: data.ml_message || (
                        status === "fraud"      ? `⚠️ High fraud risk detected across ${rowCount} records. Review immediately.` :
                        status === "suspicious" ? `⚠️ Suspicious patterns found in ${rowCount} records. Further review recommended.` :
                                                  `✅ ${rowCount} records analysed — transaction patterns appear normal.`
                    ),
                    details: { batchSize: rowCount }
                });

                // Also populate the per-user predictions table if available
                // (removed - showing combined result card only)

                // Reset the file input
                const fileInput = document.getElementById("csvUpload");
                if (fileInput) fileInput.value = "";
            }
        } catch (error) {
            console.error("CSV Upload Error:", error);
            toast.error("Upload Failed", {
                description: error.response?.data?.message || "Failed to upload CSV file"
            });
        } finally {
            setIsCsvUploading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <AnimatedBackground />
            <Sidebar />

            <main className="flex-1 p-8 overflow-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 gradient-text">Transaction Simulator</h1>
                        <p className="text-muted-foreground">Test UPI transactions for fraud detection</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Transaction Form */}
                        <Card className="glass-card border-border/50">
                            <CardHeader>
                                <CardTitle className="text-2xl">1️⃣ Single Transaction Simulation (New User)</CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">
                                    This option is used when a new user performs a transaction and there is no prior transaction history available.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Label htmlFor="senderId">Sender ID</Label>
                                            <Input
                                                id="senderId"
                                                placeholder="user@upi"
                                                value={formData.senderId}
                                                onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
                                                required
                                                className="glass-card border-border/50 mt-1"
                                            />
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Label htmlFor="receiverId">Receiver ID</Label>
                                            <Input
                                                id="receiverId"
                                                placeholder="merchant@upi"
                                                value={formData.receiverId}
                                                onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
                                                required
                                                className="glass-card border-border/50 mt-1"
                                            />
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Label htmlFor="amount">Amount</Label>
                                            <Input
                                                id="amount"
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="1000"
                                                value={formData.amount}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value === '' || /^\d*$/.test(value)) {
                                                        setFormData({ ...formData, amount: value });
                                                    }
                                                }}
                                                required
                                                className="glass-card border-border/50 mt-1"
                                            />
                                        </motion.div>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 }}
                                        className="flex gap-4 pt-4"
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={generateRandomTransaction}
                                            className="flex-1 border-primary/50 hover:bg-primary/10"
                                        >
                                            <Dice5 className="mr-2 h-4 w-4" />
                                            Generate Random
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 glow-cyan"
                                        >
                                            {isLoading ? (
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="mr-2 h-4 w-4" />
                                            )}
                                            Submit Transaction
                                        </Button>
                                    </motion.div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* CSV Upload Form */}
                        <Card className="glass-card border-border/50">
                            <CardHeader>
                                <CardTitle className="text-2xl">2️⃣ Batch CSV Upload Simulation (Existing User)</CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">
                                    This feature is used when we already have multiple transactions for a user.<br />
                                    Instead of entering them manually, they are uploaded using a CSV file.<br />
                                    This helps the ML model analyze transaction patterns and user behavior.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCsvUpload} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Label htmlFor="csvUpload">Upload CSV File</Label>
                                            <Input
                                                id="csvUpload"
                                                type="file"
                                                accept=".csv"
                                                onChange={(e) => setCsvFile(e.target.files[0])}
                                                required
                                                className="glass-card border-border/50 mt-1 cursor-pointer"
                                            />
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Accepted columns: upi_id, tx_timestamp, amount, tx_status, is_refund, device_id, geo_location, upi_created_date, is_fraud_txn
                                            </p>
                                        </motion.div>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex gap-4 pt-4"
                                    >
                                        <Button
                                            type="submit"
                                            disabled={isCsvUploading}
                                            className="w-full glow-purple"
                                        >
                                            {isCsvUploading ? (
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <UploadCloud className="mr-2 h-4 w-4" />
                                            )}
                                            Upload Transactions
                                        </Button>
                                    </motion.div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Result Display — full width below the forms */}
                    <AnimatePresence mode="wait">
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5 }}
                                className="mt-8"
                            >
                                    <Card className={`glass-card border-2 ${
                                        result.status === "fraud" ? "border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                                        : result.status === "suspicious" ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
                                        : result.status === "safe" ? "border-success/50" 
                                        : result.status === "history_required" ? "border-purple-500/50"
                                        : "border-border/50"
                                    }`}>
                                        <CardContent className="p-8">
                                            {/* Top row: title + status badge */}
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-2xl font-bold tracking-tight">Analysis Result</h3>
                                                {result.status === "fraud" ? (
                                                    <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                                                        <AlertTriangle className="h-4 w-4" /> FRAUD DETECTED
                                                    </span>
                                                ) : result.status === "suspicious" ? (
                                                    <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                                                        <AlertTriangle className="h-4 w-4" /> SUSPICIOUS
                                                    </span>
                                                ) : result.status === "safe" ? (
                                                    <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                        <CheckCircle className="h-4 w-4" /> SAFE
                                                    </span>
                                                ) : result.status === "history_required" ? (
                                                    <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                                        <UploadCloud className="h-4 w-4" /> HISTORY REQUIRED
                                                    </span>
                                                ) : null}
                                            </div>

                                            {/* Main 3-column layout */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

                                                {/* LEFT: Transaction ID + Status */}
                                                <div className="space-y-6">
                                                    {result.transactionId && (
                                                        <div>
                                                            <div className="text-sm font-semibold text-foreground/60 uppercase tracking-widest mb-2">Transaction ID</div>
                                                            <div className="text-base font-mono font-semibold text-foreground/90 bg-white/5 px-4 py-3 rounded-lg border border-white/10 break-all">
                                                                {result.transactionId}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-semibold text-foreground/60 uppercase tracking-widest mb-2">Status</div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`h-3.5 w-3.5 rounded-full ${
                                                                result.status === "fraud"        ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
                                                                : result.status === "suspicious" ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.7)]"
                                                                : result.status === "safe"       ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                                                                : "bg-purple-500"
                                                            }`} />
                                                            <span className={`text-2xl font-extrabold tracking-wide ${
                                                                result.status === "fraud"        ? "text-red-400"
                                                                : result.status === "suspicious" ? "text-orange-400"
                                                                : result.status === "safe"       ? "text-emerald-400"
                                                                : "text-purple-400"
                                                            }`}>
                                                                {result.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* CENTRE: Risk Score Gauge */}
                                                {result.riskScore !== undefined && (() => {
                                                    const score = result.riskScore;
                                                    const isFraud = result.status === "fraud";
                                                    const isSuspicious = result.status === "suspicious";
                                                    const color = isFraud ? "#ef4444" : isSuspicious ? "#f97316" : "#22c55e";
                                                    const bgGlow = isFraud ? "rgba(239,68,68,0.12)" : isSuspicious ? "rgba(249,115,22,0.12)" : "rgba(34,197,94,0.12)";

                                                    return (
                                                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl py-6"
                                                             style={{ background: `radial-gradient(circle at center, ${bgGlow}, transparent 70%)` }}>
                                                            <div className="text-sm font-semibold text-foreground/60 uppercase tracking-widest">Risk Score</div>

                                                            {/* CSS conic-gradient ring */}
                                                            <div style={{
                                                                width: 160,
                                                                height: 160,
                                                                borderRadius: "50%",
                                                                background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.07) 0deg)`,
                                                                boxShadow: `0 0 24px ${color}40`,
                                                                padding: 12,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            }}>
                                                                {/* Inner filled circle (mask) */}
                                                                <div style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    borderRadius: "50%",
                                                                    background: "hsl(var(--background))",
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    gap: 2
                                                                }}>
                                                                    <span style={{ color, fontSize: 38, fontWeight: 900, lineHeight: 1 }}>{score}</span>
                                                                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em" }}>RISK SCORE</span>
                                                                </div>
                                                            </div>

                                                            {/* Risk level badge */}
                                                            <div className="px-4 py-1.5 rounded-full text-sm font-semibold border"
                                                                 style={{ color, borderColor: `${color}40`, backgroundColor: `${color}15` }}>
                                                                {isFraud ? "🔴 High Risk" : isSuspicious ? "🟠 Medium Risk" : "🟢 Low Risk"}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* RIGHT: Analysis */}
                                                <div className="flex flex-col justify-center">
                                                    <div className="text-sm font-semibold text-foreground/60 uppercase tracking-widest mb-3">Analysis</div>
                                                    <p className="text-base text-foreground/80 leading-relaxed">{result.reason}</p>
                                                    {result.details?.batchSize && (
                                                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono font-semibold">{result.details.batchSize}</span>
                                                            <span>records analysed</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Clear button */}
                                            <Button onClick={resetForm} className="w-full mt-8" variant="outline">
                                                Clear Transaction
                                            </Button>
                                        </CardContent>
                                    </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            </main>
        </div>
    );
}
