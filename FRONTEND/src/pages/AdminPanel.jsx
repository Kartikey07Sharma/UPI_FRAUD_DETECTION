import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// No mock data - waiting for backend connection

export default function AdminPanel() {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const handleExportCSV = (type) => {
        const data = type === 'users' ? users : transactions;
        if (data.length === 0) {
            alert(`No ${type} available to export.`);
            return;
        }
        // Simple CSV export simulation
        const headers = type === 'users'
            ? ['Name', 'UPI ID', 'Transactions', 'Avg Amount', 'Risk Level']
            : ['Transaction ID', 'From', 'To', 'Amount', 'Date', 'Status'];

        console.log(`Exporting ${type} as CSV:`, { headers, data });
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`);
    };

    const handleViewUserDetails = (user) => {
        alert(`Viewing details for: ${user.name}\nUPI ID: ${user.upiId}\nTransactions: ${user.transactions}\nAverage Amount: ${user.avgAmount}\nRisk Level: ${user.riskLevel}`);
    };

    const handleMarkTransaction = (txnId, newStatus) => {
        setTransactions(prev => prev.map(txn =>
            txn.id === txnId ? { ...txn, status: newStatus, flagged: newStatus === 'fraud' } : txn
        ));
        alert(`Transaction ${txnId} marked as ${newStatus}`);
    };

    const filteredTransactions = transactions.filter(txn =>
        searchQuery === "" ||
        txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.to.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRiskBadge = (level) => {
        switch (level) {
            case "high":
                return <Badge variant="destructive">High Risk</Badge>;
            case "medium":
                return <Badge className="bg-warning/20 text-warning">Medium Risk</Badge>;
            default:
                return <Badge className="bg-success/20 text-success">Low Risk</Badge>;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "fraud":
                return <XCircle className="h-5 w-5 text-destructive" />;
            case "pending":
                return <AlertCircle className="h-5 w-5 text-warning" />;
            default:
                return <CheckCircle className="h-5 w-5 text-success" />;
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
                        <h1 className="text-4xl font-bold mb-2 gradient-text">Admin Panel</h1>
                        <p className="text-muted-foreground">Manage users and transactions</p>
                    </div>

                    {/* Users Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <Card className="glass-card border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>User Management</span>
                                    <Button variant="outline" size="sm" className="border-primary/50" onClick={() => handleExportCSV('users')} disabled={users.length === 0}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg overflow-hidden border border-border/30">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="glass-card border-border/30 hover:bg-muted/50">
                                                <TableHead>Name</TableHead>
                                                <TableHead>UPI ID</TableHead>
                                                <TableHead className="text-center">Transactions</TableHead>
                                                <TableHead className="text-center">Avg Amount</TableHead>
                                                <TableHead className="text-center">Risk Level</TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.length > 0 ? users.map((user, index) => (
                                                <motion.tr
                                                    key={user.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + index * 0.05 }}
                                                    className="glass-card border-border/20 hover:bg-muted/30 transition-colors"
                                                >
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell className="font-mono text-sm">{user.upiId}</TableCell>
                                                    <TableCell className="text-center">{user.transactions}</TableCell>
                                                    <TableCell className="text-center font-semibold">{user.avgAmount}</TableCell>
                                                    <TableCell className="text-center">{getRiskBadge(user.riskLevel)}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Button size="sm" variant="outline" className="text-xs" onClick={() => handleViewUserDetails(user)}>
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </motion.tr>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                                                        No users available
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Transactions Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="glass-card border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Transaction History</span>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search transactions..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 w-64 glass-card border-border/50"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" className="border-primary/50" onClick={() => handleExportCSV('transactions')} disabled={filteredTransactions.length === 0}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg overflow-hidden border border-border/30">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="glass-card border-border/30 hover:bg-muted/50">
                                                <TableHead>Transaction ID</TableHead>
                                                <TableHead>From</TableHead>
                                                <TableHead>To</TableHead>
                                                <TableHead className="text-center">Amount</TableHead>
                                                <TableHead className="text-center">Date</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTransactions.length > 0 ? filteredTransactions.map((txn, index) => (
                                                <motion.tr
                                                    key={txn.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.2 + index * 0.05 }}
                                                    className={`glass-card border-border/20 hover:bg-muted/30 transition-colors ${txn.flagged ? "bg-destructive/5" : ""
                                                        }`}
                                                >
                                                    <TableCell className="font-mono font-medium">{txn.id}</TableCell>
                                                    <TableCell className="font-mono text-sm">{txn.from}</TableCell>
                                                    <TableCell className="font-mono text-sm">{txn.to}</TableCell>
                                                    <TableCell className="text-center font-semibold">{txn.amount}</TableCell>
                                                    <TableCell className="text-center text-sm text-muted-foreground">
                                                        {txn.date}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {getStatusIcon(txn.status)}
                                                            <span className="text-sm capitalize">{txn.status}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-xs border-success/50 text-success hover:bg-success/10"
                                                                onClick={() => handleMarkTransaction(txn.id, 'legitimate')}
                                                            >
                                                                Mark Legitimate
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleMarkTransaction(txn.id, 'fraud')}
                                                            >
                                                                Mark Fraud
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">
                                                        No transactions available
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}
