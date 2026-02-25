import { NavLink } from "@/components/NavLink";
import {
    LayoutDashboard,
    Send,
    BarChart3,
    Shield,
    Menu,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "./ui/button";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Send, label: "Transaction Simulator", path: "/simulator" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Shield, label: "Admin Panel", path: "/admin" },
];

export const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            {/* Mobile Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden glass-card"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: "spring", damping: 20 }}
                        className="fixed left-0 top-0 h-screen w-64 glass-card border-r border-border/50 p-6 z-40 md:relative"
                    >
                        <div className="flex flex-col h-full">
                            {/* Logo */}
                            <div className="mb-8 mt-12 md:mt-0">
                                <h2 className="text-2xl font-bold gradient-text">UPI Fraud</h2>
                                <p className="text-sm text-muted-foreground">Detection System</p>
                            </div>

                            {/* Menu Items */}
                            <nav className="flex-1 space-y-2">
                                {menuItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-primary/10"
                                        activeClassName="bg-primary/20 text-primary font-medium glow-cyan"
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>

                            {/* Footer */}
                            <div className="mt-auto pt-6 border-t border-border/50">
                                <div className="text-xs text-muted-foreground">
                                    <p>v1.0.0</p>
                                    <p className="mt-1">© 2025 UPI Fraud Detection</p>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};
