import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

import { getAnalytics } from "@/services/api";

export default function Dashboard() {
    const [stats, setStats] = useState([
        {
            title: "Total Transactions",
            value: "0",
            change: "---",
            icon: Activity,
            color: "text-primary",
            bgColor: "bg-primary/10"
        },
        {
            title: "Flagged Transactions",
            value: "0",
            change: "---",
            icon: AlertTriangle,
            color: "text-warning",
            bgColor: "bg-warning/10"
        },
        {
            title: "Safe Transactions",
            value: "0",
            change: "---",
            icon: CheckCircle,
            color: "text-success",
            bgColor: "bg-success/10"
        },
        {
            title: "Detection Rate",
            value: "---",
            change: "---",
            icon: TrendingUp,
            color: "text-secondary",
            bgColor: "bg-secondary/10"
        }
    ]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAnalytics();
                if (response.data.success) {
                    const { pieChartData, recentTransactions } = response.data;
                    const [safe, suspicious, flagged] = pieChartData.datasets[0].data;
                    const total = Number(safe) + Number(suspicious) + Number(flagged);
                    const detectionRate = total > 0 ? ((Number(flagged) / total) * 100).toFixed(1) + "%" : "0%";

                    setStats(prev => [
                        { ...prev[0], value: total.toString() },
                        { ...prev[1], value: flagged.toString() },
                        { ...prev[2], value: safe.toString() },
                        { ...prev[3], value: detectionRate }
                    ]);

                    setRecentActivity(recentTransactions || []);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl">Loading Dashboard...</div>
            </div>
        );
    }

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
                    <div className="mb-8 font-inter">
                        <h1 className="text-4xl font-bold mb-2 gradient-text">Fraud Detection Dashboard</h1>
                        <p className="text-muted-foreground">Monitor your UPI transaction security in real-time</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 font-outfit">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="glass-card border-border/50 hover:border-primary/50 transition-all duration-300">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                        <div className={`${stat.bgColor} p-2 rounded-lg`}>
                                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                        {stat.change !== "---" && (
                                            <p className={`text-xs ${stat.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                                                {stat.change} from last month
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="glass-card border-border/50">
                            <CardHeader>
                                <CardTitle className="text-2xl">Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity, index) => (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                className="flex items-center justify-between p-4 rounded-lg glass-card border border-border/30 hover:border-primary/50 transition-all"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold">{activity.id}</span>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full ${activity.status === "safe"
                                                                ? "bg-success/20 text-success"
                                                                : activity.status === "suspicious"
                                                                    ? "bg-warning/20 text-warning"
                                                                    : "bg-destructive/20 text-destructive"
                                                                }`}
                                                        >
                                                            {activity.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {activity.sender} → {activity.receiver}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lg">{activity.amount}</div>
                                                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground italic">
                                            No transactions available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}
