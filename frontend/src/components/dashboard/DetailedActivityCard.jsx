import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FiArrowDownRight, FiArrowUpRight, FiMoreHorizontal, FiActivity, FiCreditCard, FiShoppingBag, FiTruck, FiCoffee, FiClock } from 'react-icons/fi';

export default function DetailedActivityCard({ transactions, bills, budgets, balanceHistory }) {

    // --- MOCK DATA (If props not provided) ---
    const mockBudgets = budgets || [
        { category: 'Food & Dining', spent: 450, limit: 600, color: '#10b981' },
        { category: 'Shopping', spent: 340, limit: 400, color: '#f59e0b' },
        { category: 'Transportation', spent: 120, limit: 200, color: '#8b5cf6' },
        { category: 'Entertainment', spent: 85, limit: 150, color: '#ec4899' },
    ];

    const mockBills = bills || [
        { name: 'Internet Provider', amount: 79.99, due: '2 days', logo: '🌐' },
        { name: 'City Electric', amount: 145.00, due: 'Dec 28', logo: '⚡' },
        { name: 'Netflix Subscription', amount: 15.99, due: 'Dec 29', logo: '🎬' },
        { name: 'Water Company', amount: 45.00, due: 'Dec 31', logo: '💧' },
    ];

    // Use passed history or fallbacks
    const data = balanceHistory && balanceHistory.length > 0 ? balanceHistory : [
        { date: 'Jan', balance: 4000 }, { date: 'Feb', balance: 3500 },
        { date: 'Mar', balance: 5000 }, { date: 'Apr', balance: 4800 },
        { date: 'May', balance: 6000 }, { date: 'Jun', balance: 5500 }
    ];

    // Use passed transactions or fallbacks
    const displayTransactions = transactions && transactions.length > 0 ? transactions.slice(0, 5) : [
        { id: 1, description: 'Whole Foods', category: 'Food & Dining', amount: -127.41, date: 'Dec 21, 2024', icon: <FiCoffee /> },
        { id: 2, description: 'TechCorp Inc', category: 'Income', amount: 3800.00, date: 'Dec 20, 2024', icon: <FiArrowDownRight className="text-emerald-400" /> },
        { id: 3, description: 'Netflix', category: 'Entertainment', amount: -15.99, date: 'Dec 19, 2024', icon: <FiActivity /> },
        { id: 4, description: 'Shell Station', category: 'Transportation', amount: -52.30, date: 'Dec 18, 2024', icon: <FiTruck /> },
        { id: 5, description: 'Amazon', category: 'Shopping', amount: -234.99, date: 'Dec 17, 2024', icon: <FiShoppingBag /> },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-white/10 p-3 rounded-xl shadow-2xl">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] mb-1 font-medium">{label}</p>
                    <p className="text-emerald-500 dark:text-emerald-400 font-bold text-sm">Rs. {payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };


    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* LEFT COLUMN: Recent Transactions & Balance Graph */}
            <div className="space-y-6">

                {/* 1. RECENT TRANSACTIONS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full rounded-[2rem] bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-white/5 p-6 shadow-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">Recent Transactions</h3>
                        <Link to="/dashboard/transactions" className="text-emerald-500 dark:text-emerald-400 text-xs font-bold hover:text-emerald-600 dark:hover:text-emerald-300">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {displayTransactions.map((txn, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${txn.amount > 0 ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}`}>
                                        {txn.amount > 0 ? <FiArrowDownRight /> : (txn.icon || <FiCreditCard />)}
                                    </div>
                                    <div>
                                        <p className="text-slate-900 dark:text-white font-semibold text-sm">{txn.description}</p>
                                        <p className="text-slate-500 dark:text-slate-500 text-[10px] uppercase font-bold">{txn.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm ${txn.amount > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                        {txn.amount > 0 ? '+' : ''}${Math.abs(txn.amount).toFixed(2)}
                                    </p>
                                    <p className="text-slate-500 text-[10px]">{txn.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 2. SPENDING TREND (Area Chart - Restored "Early Graph") */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full rounded-[2rem] bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-white/5 p-6 shadow-xl relative"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">Balance Activity</h3>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">Growth +12.5%</span>
                    </div>

                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeOpacity={0.1} stroke="currentColor" className="text-slate-400 dark:text-white" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#colorBalance)"
                                    activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>


            {/* RIGHT COLUMN: Budget & Bills */}
            <div className="space-y-6">

                {/* 3. BUDGET OVERVIEW */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full rounded-[2rem] bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-white/5 p-6 shadow-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">Budget Overview</h3>
                        <Link to="/dashboard/budgets" className="text-slate-400 dark:text-slate-400 text-xs hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors font-bold">Manage</Link>
                    </div>

                    <div className="space-y-5">
                        {(budgets && budgets.length > 0 ? budgets.slice(0, 4) : mockBudgets).map((budget, i) => {
                            // Normalize Data (Real vs Mock)
                            const isReal = !!budget.limit_amount;
                            const spent = isReal ? Number(budget.spent_amount) : budget.spent;
                            const limit = isReal ? Number(budget.limit_amount) : budget.limit;
                            const percent = Math.min((spent / limit) * 100, 100);

                            // Color Logic
                            let color = budget.color || '#10b981';
                            if (isReal) {
                                if (percent > 90) color = '#f43f5e'; // Rose
                                else if (percent > 70) color = '#f59e0b'; // Amber
                                else color = '#10b981'; // Emerald
                            }

                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-1">
                                        <p className="text-slate-700 dark:text-white text-xs font-bold">{budget.category}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-[10px]">Rs. {spent.toLocaleString()} / Rs. {limit.toLocaleString()}</p>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${percent}%`, backgroundColor: color }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}

                        {budgets && budgets.length === 0 && (
                            <div className="text-center py-4 text-slate-500 text-xs">No budgets set. <Link to="/dashboard/budgets" className="text-emerald-500 hover:underline">Create one</Link></div>
                        )}
                    </div>
                </motion.div>

                {/* 4. UPCOMING BILLS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full rounded-[2rem] bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-white/5 p-6 shadow-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">Upcoming Bills</h3>
                        <Link to="/dashboard/bills" className="text-emerald-500 dark:text-emerald-400 text-xs font-bold hover:text-emerald-600 dark:hover:text-emerald-300">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {(bills && bills.length > 0 ? bills.filter(b => b.status !== 'paid').slice(0, 4) : mockBills).map((bill, i) => {
                            // Handle data mapping (Real vs Mock)
                            const isReal = !!bill.biller_name;
                            const name = isReal ? bill.biller_name : bill.name;
                            const amount = isReal ? bill.amount_due : bill.amount;
                            const dateStr = isReal ? new Date(bill.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : bill.due;

                            return (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center text-lg shadow-lg">
                                            {isReal ? <FiClock className="text-emerald-500 dark:text-emerald-400" /> : bill.logo}
                                        </div>
                                        <div>
                                            <p className="text-slate-900 dark:text-white font-bold text-xs group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">{name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <FiClock className="text-amber-500" size={10} />
                                                <p className="text-slate-500 text-[10px]">{dateStr}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-slate-900 dark:text-white font-bold text-sm text-right">Rs. {Number(amount).toFixed(2)}</p>
                                        <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">
                                            Pay
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        {bills && bills.length === 0 && (
                            <div className="text-center py-4 text-slate-500 text-xs">No upcoming bills</div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
