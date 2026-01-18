import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiDownload, FiUpload, FiFilter, FiX } from 'react-icons/fi';
import { ShoppingBag, Utensils, Car, Zap, Film, Heart, ArrowRightLeft, Wallet, CreditCard, Coffee, Smartphone, Home, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

export default function Transactions() {
    const [txns, setTxns] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    // Filters
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All"); // All, Income, Expense
    const [categoryFilter, setCategoryFilter] = useState("All");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [txnRes, accRes] = await Promise.all([
                api.get('/transactions/all'),
                api.get('/accounts/')
            ]);
            setTxns(txnRes.data);
            setAccounts(accRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
            toast.error("Failed to load transactions.");
        } finally {
            setLoading(false);
        }
    };

    const getAccountName = (accountId) => {
        const acc = accounts.find(a => a.id === accountId);
        return acc ? `${acc.bank_name} (...${acc.masked_account})` : 'Unknown Account';
    };

    // --- Smart Category Icon Logic ---
    const getCategoryIcon = (category) => {
        const cat = category.toLowerCase();
        if (cat.includes('shop') || cat.includes('cloth')) return <ShoppingBag size={20} />;
        if (cat.includes('food') || cat.includes('rest') || cat.includes('din')) return <Utensils size={20} />;
        if (cat.includes('transport') || cat.includes('uber') || cat.includes('fuel')) return <Car size={20} />;
        if (cat.includes('bill') || cat.includes('util') || cat.includes('electric')) return <Zap size={20} />;
        if (cat.includes('entertain') || cat.includes('movie') || cat.includes('netf')) return <Film size={20} />;
        if (cat.includes('health') || cat.includes('doc') || cat.includes('pharm')) return <Heart size={20} />;
        if (cat.includes('transfer')) return <ArrowRightLeft size={20} />;
        if (cat.includes('salary') || cat.includes('income')) return <Wallet size={20} />;
        if (cat.includes('coffee')) return <Coffee size={20} />;
        if (cat.includes('tech') || cat.includes('phone')) return <Smartphone size={20} />;
        if (cat.includes('rent')) return <Home size={20} />;
        return <CreditCard size={20} />;
    };

    // --- Filtering Logic ---
    const filteredTxns = txns.filter(t => {
        const matchesSearch = t.merchant.toLowerCase().includes(search.toLowerCase()) ||
            t.category.toLowerCase().includes(search.toLowerCase());

        // Chip Filter Logic
        let matchesType = true;
        if (activeFilter === "Income") matchesType = t.txn_type === 'credit';
        if (activeFilter === "Expense") matchesType = t.txn_type === 'debit';

        const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    // --- Export ---
    const handleExport = () => {
        const headers = ["ID", "Date", "Merchant", "Category", "Account", "Type", "Amount", "Currency"];
        const csvContent = [
            headers.join(","),
            ...filteredTxns.map(t => [
                t.id,
                new Date(t.txn_date).toLocaleDateString(),
                t.merchant,
                t.category,
                getAccountName(t.account_id),
                t.txn_type,
                t.amount,
                t.currency
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "transactions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            // ... (Import logic remains same, abbreviated for brevity as it was working)
            // Re-implementing import logic for completeness
            const content = e.target.result;
            const lines = content.split(/\r\n|\n/);
            if (lines.length < 2) { toast.error("File is empty"); return; }

            const newTxns = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                const cols = line.split(',');
                // Simplified safe parsing for demo
                const amount = parseFloat(cols[3] || "0") || 0;
                newTxns.push({
                    id: `import-${Date.now()}-${i}`,
                    txn_date: new Date().toISOString(),
                    merchant: cols[1] || "Unknown",
                    category: cols[2] || "Uncategorized",
                    amount: Math.abs(amount),
                    txn_type: amount < 0 ? 'debit' : 'credit',
                    account_id: accounts[0]?.id || 1,
                    currency: 'USD'
                });
            }
            setTxns(prev => [...newTxns, ...prev]);
            toast.success(`Imported ${newTxns.length} transactions`);
            event.target.value = null;
        };
        reader.readAsText(file);
    };

    // Fixed Categories for clearer filtering
    // Fixed Categories for clearer filtering
    const categories = [
        "All",
        "Shopping",
        "Food",
        "Transport",
        "Bills & Utilities",
        "Entertainment",
        "Health",
        "Other"
    ];
    const filters = ["All", "Income", "Expense"];

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Transactions</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track every penny with precision.</p>
                </div>
                <div className="flex gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".csv" className="hidden" />
                    <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-white dark:bg-[#1e293b] hover:bg-slate-50 dark:hover:bg-[#253045] text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl transition-all font-medium border border-slate-200 dark:border-white/5 shadow-sm">
                        <FiUpload /> Import
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-lg shadow-emerald-900/20">
                        <FiDownload /> Export
                    </button>
                </div>
            </div>

            {/* Smart Filters Bar */}
            <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/5 p-2 rounded-2xl flex flex-col lg:flex-row gap-4 backdrop-blur-md items-center shadow-xl">

                {/* Search */}
                <div className="relative flex-1 w-full lg:w-auto">
                    <FiSearch className="absolute left-4 top-3.5 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by merchant or category..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1e293b]/50 border border-transparent focus:border-indigo-500/50 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1e293b] transition-all"
                    />
                </div>

                {/* Featured Filter Chips */}
                <div className="flex items-center gap-2 p-1 bg-[#1e293b]/50 rounded-xl border border-white/5">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all relative overflow-hidden ${activeFilter === filter
                                ? 'text-white shadow-lg'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/5'
                                }`}
                        >
                            {activeFilter === filter && (
                                <motion.div
                                    layoutId="activePill"
                                    className="absolute inset-0 bg-indigo-600 rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{filter}</span>
                        </button>
                    ))}
                </div>

                {/* Category Dropdown */}
                <div className="relative min-w-[200px]">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 dark:bg-[#1e293b]/50 border border-transparent hover:border-slate-200 dark:hover:border-white/10 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500/50 cursor-pointer transition-colors"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                        ))}
                    </select>
                    <FiFilter className="absolute right-4 top-3.5 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                                <th className="p-6 font-semibold">Merchant</th>
                                <th className="p-6 font-semibold">Category</th>
                                <th className="p-6 font-semibold">Status</th>
                                <th className="p-6 font-semibold">Account</th>
                                <th className="p-6 font-semibold">Date</th>
                                <th className="p-6 font-semibold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            <AnimatePresence>
                                {loading ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-slate-500">Loading your history...</td></tr>
                                ) : filteredTxns.length === 0 ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-slate-500">No transactions match your filters.</td></tr>
                                ) : (
                                    filteredTxns.map((txn, i) => (
                                        <motion.tr
                                            key={txn.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group cursor-default"
                                        >
                                            {/* Merchant with Smart Icon */}
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${txn.txn_type === 'credit'
                                                        ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shadow-emerald-500/10'
                                                        : 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shadow-indigo-500/10'
                                                        }`}>
                                                        {getCategoryIcon(txn.category)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{txn.merchant}</div>
                                                        <div className="text-xs text-slate-500 font-mono mt-0.5 max-w-[150px] truncate">{String(txn.id).slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category Pill */}
                                            <td className="p-6">
                                                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 group-hover:border-indigo-500/30 transition-colors">
                                                    {txn.category}
                                                </span>
                                            </td>

                                            {/* Status/Type */}
                                            <td className="p-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${txn.txn_type === 'credit' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                                                    {txn.txn_type === 'credit' ? 'Income' : 'Expense'}
                                                </div>
                                            </td>

                                            {/* Account */}
                                            <td className="p-6 text-sm text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase size={14} className="text-slate-600" />
                                                    {getAccountName(txn.account_id)}
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="p-6 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="font-medium text-slate-700 dark:text-slate-300">{new Date(txn.txn_date).toLocaleDateString()}</div>
                                                <div className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{new Date(txn.txn_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>

                                            {/* Amount */}
                                            <td className="p-6 text-right">
                                                <div className={`text-sm font-black font-mono tracking-tight ${txn.txn_type === 'credit' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
                                                    {txn.txn_type === 'credit' ? '+' : '-'} Rs. {Math.abs(txn.amount).toLocaleString()}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}