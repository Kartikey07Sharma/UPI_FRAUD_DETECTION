import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import TransactionSimulator from "./pages/TransactionSimulator";
import Analytics from "./pages/Analytics";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => {
    // Basic backend connection check
    React.useEffect(() => {
        const checkConnection = async () => {
            try {
                const { checkBackendHealth } = await import("./services/api");
                const response = await checkBackendHealth();
                if (response.data) {
                    toast("Backend Connected", {
                        description: response.data.message || "Successfully connected to server",
                    });
                }
            } catch (error) {
                console.error("Backend connection error:", error);
                // toast.error("Backend Disconnected", {
                //     description: "Could not connect to the server. Is it running?",
                // });
            }
        };
        checkConnection();
    }, []);

    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Auth />} />
                        <Route path="/simulator" element={isAuthenticated ? <TransactionSimulator /> : <Auth />} />
                        <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Auth />} />
                        <Route path="/admin" element={isAuthenticated ? <AdminPanel /> : <Auth />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;
