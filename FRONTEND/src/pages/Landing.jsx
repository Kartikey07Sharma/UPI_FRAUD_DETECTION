import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { TypewriterText } from "@/components/TypewriterText";
import { Shield, ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import securityIcon from "@/assets/security-icon.png";
import aiIcon from "@/assets/ai-icon.png";
import analyticsIcon from "@/assets/analytics-icon.png";

const features = [
    {
        icon: securityIcon,
        title: "AI-Powered Risk Scoring",
        description: "Advanced machine learning algorithms analyze transaction patterns in real-time to detect anomalies and assign risk scores.",
        gradient: "from-neon-cyan to-neon-purple",
    },
    {
        icon: aiIcon,
        title: "Real-Time Fraud Detection",
        description: "Instant analysis of UPI transactions with lightning-fast response times, blocking suspicious activities before they complete.",
        gradient: "from-neon-purple to-neon-pink",
    },
    {
        icon: analyticsIcon,
        title: "Smart Analytics Dashboard",
        description: "Comprehensive insights with interactive charts, fraud trends, and detailed reports to monitor your transaction security.",
        gradient: "from-neon-pink to-neon-cyan",
    },
];

const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Monitoring" },
    { value: "Bank-Grade", label: "Security" },
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen overflow-hidden">
            <AnimatedBackground />

            {/* Header */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
            >
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold gradient-text">UPI Fraud Detection</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate("/auth")}>
                            Login
                        </Button>
                        <Button onClick={() => navigate("/auth")} className="glow-cyan">
                            Get Started
                        </Button>
                    </div>
                </div>
            </motion.header>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-4 pt-20">
                <div className="container mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            UPI Fraud Detection System
                        </h1>
                        <div className="text-3xl md:text-4xl font-semibold mb-6 h-16 gradient-text">
                            <TypewriterText
                                words={[
                                    "Secure Transactions",
                                    "AI-Powered Protection",
                                    "Real-Time Monitoring",
                                    "Smart Analytics",
                                ]}
                            />
                        </div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mb-8 p-6 glass-card rounded-2xl border border-primary/20 max-w-2xl mx-auto"
                        >
                            <p className="text-lg text-muted-foreground">
                                AI-powered fraud monitoring and analytics system for secure UPI transactions.
                                Detect suspicious activities in real-time and protect your digital payments.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                        >
                            <Button
                                size="lg"
                                onClick={() => navigate("/auth")}
                                className="group glow-cyan text-lg px-8 py-6"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-primary text-lg px-8 py-6 hover:bg-primary/10"
                            >
                                <Play className="mr-2 h-5 w-5" />
                                Watch Demo
                            </Button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                        >
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                            Powerful Features
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Advanced technology to keep your transactions safe and secure
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05, rotateY: 5 }}
                                className="glass-card p-8 rounded-2xl border border-border/50 hover:border-primary/50 transition-all group"
                            >
                                <div className={`w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} p-1`}>
                                    <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
                                        <img src={feature.icon} alt="" className="w-12 h-12" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="py-12 px-4 border-t border-border/50 glass-card"
            >
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold mb-4 gradient-text">UPI Fraud Detection</h3>
                            <p className="text-sm text-muted-foreground">
                                Securing digital payments with AI-powered fraud detection.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <p className="text-sm text-muted-foreground">
                                support@upifraud.com<br />
                                +1 (555) 123-4567
                            </p>
                        </div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border/50">
                        <p>© 2025 UPI Fraud Detection System. All rights reserved.</p>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
}
