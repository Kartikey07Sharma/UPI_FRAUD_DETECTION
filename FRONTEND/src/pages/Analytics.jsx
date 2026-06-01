import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: "hsl(210 40% 98%)",
            },
        },
    },
    scales: {
        y: {
            ticks: { color: "hsl(215 20% 65%)" },
            grid: { color: "hsl(222 47% 25% / 0.3)" },
        },
        x: {
            ticks: { color: "hsl(215 20% 65%)" },
            grid: { color: "hsl(222 47% 25% / 0.3)" },
        },
    },
};

const barChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
        {
            label: "Total Transactions",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "hsl(189 94% 43% / 0.6)",
            borderColor: "hsl(189 94% 43%)",
            borderWidth: 2,
        },
        {
            label: "Fraudulent",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "hsl(0 84% 60% / 0.6)",
            borderColor: "hsl(0 84% 60%)",
            borderWidth: 2,
        },
    ],
};

const lineChartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
        {
            label: "Fraud Trend",
            data: [0, 0, 0, 0],
            borderColor: "hsl(271 91% 65%)",
            backgroundColor: "hsl(271 91% 65% / 0.1)",
            tension: 0.4,
            fill: true,
        },
    ],
};

const pieChartData = {
    labels: ["Safe", "Suspicious", "Flagged"],
    datasets: [
        {
            data: [0, 0, 0],
            backgroundColor: [
                "hsl(142 76% 36%)",
                "hsl(38 92% 50%)",
                "hsl(0 84% 60%)",
            ],
            borderWidth: 2,
            borderColor: "hsl(222 47% 11%)",
        },
    ],
};

const featureImportance = [
    { feature: "Transaction Amount", importance: 0 },
    { feature: "Location Anomaly", importance: 0 },
    { feature: "Device History", importance: 0 },
    { feature: "Time Pattern", importance: 0 },
    { feature: "Recipient Trust Score", importance: 0 },
];

import { getAnalytics } from "@/services/api";

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await getAnalytics();
                if (response.data.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Analytics Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    const bData = data?.barChartData || barChartData;
    const pData = data?.pieChartData || pieChartData;
    const lData = data?.lineChartData || lineChartData;
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
                        <h1 className="text-4xl font-bold mb-2 gradient-text">Analytics Dashboard</h1>
                        <p className="text-muted-foreground">Comprehensive insights into fraud detection patterns</p>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass-card border-border/50">
                                <CardHeader>
                                    <CardTitle>Transactions vs Fraudulent</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <Bar data={bData} options={chartOptions} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass-card border-border/50">
                                <CardHeader>
                                    <CardTitle>Fraud Trends Over Time</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <Line data={lData} options={chartOptions} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="glass-card border-border/50">
                                <CardHeader>
                                    <CardTitle>Transaction Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 flex items-center justify-center">
                                        <div className="w-full max-w-sm">
                                            <Doughnut
                                                data={pData}
                                                options={{
                                                    ...chartOptions,
                                                    scales: undefined,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="glass-card border-border/50">
                                <CardHeader>
                                    <CardTitle>Feature Importance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {(data?.modelMetrics?.featureImportance || featureImportance).map((item, index) => (
                                            <motion.div
                                                key={item.feature}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                className="space-y-2"
                                            >
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">{item.feature}</span>
                                                    <span className="text-primary font-bold">{item.importance}%</span>
                                                </div>
                                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.importance}%` }}
                                                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                                                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                                        style={{
                                                            boxShadow: "0 0 10px hsl(189 94% 43% / 0.5)",
                                                        }}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Model Performance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="glass-card border-border/50">
                            <CardHeader>
                                <CardTitle>Model Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-4 gap-6">
                                    {[
                                        { label: "Accuracy", value: data?.modelMetrics ? (data.modelMetrics.accuracy * 100).toFixed(2) + "%" : "---" },
                                        { label: "Precision", value: data?.modelMetrics ? (data.modelMetrics.precision * 100).toFixed(2) + "%" : "---" },
                                        { label: "Recall", value: data?.modelMetrics ? (data.modelMetrics.recall * 100).toFixed(2) + "%" : "---" },
                                        { label: "F1-Score", value: data?.modelMetrics ? (data.modelMetrics.f1_score * 100).toFixed(2) + "%" : "---" },
                                    ].map((metric, index) => (
                                        <motion.div
                                            key={metric.label}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.6 + index * 0.1 }}
                                            className="p-6 rounded-xl glass-card border border-primary/30 text-center"
                                        >
                                            <div className="text-4xl font-bold text-primary mb-2">{metric.value}</div>
                                            <div className="text-sm text-muted-foreground">{metric.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}
