import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, Activity, AlertTriangle, Wallet, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

export default function Insights() {
    const [cashFlowData, setCashFlowData] = useState([]);
    const [topMerchants, setTopMerchants] = useState([]);
    const [burnRate, setBurnRate] = useState(null);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const [cashFlowRes, merchantsRes, burnRes, expensesRes] = await Promise.all([
                api.get('/insights/cash-flow?months=6'),
                api.get('/insights/top-merchants?limit=5'),
                api.get('/insights/burn-rate'),
                api.get('/insights/expense-by-category?months=3')
            ]);

            setCashFlowData(cashFlowRes.data);
            setTopMerchants(merchantsRes.data);
            setBurnRate(burnRes.data);
            setExpenseCategories(expensesRes.data);
        } catch (error) {
            console.error("Failed to load insights", error);
            toast.error("Failed to load insights data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    const GRADIENT_COLORS = [
        ['#10b981', '#059669'],
        ['#3b82f6', '#2563eb'],
        ['#f59e0b', '#d97706'],
        ['#ef4444', '#dc2626'],
        ['#8b5cf6', '#7c3aed']
    ];

    const handleExport = () => {
        toast.success("Export functionality coming soon!");
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 animate-spin border-t-emerald-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/50 blur-sm"></div>
                </div>
            </div>
        </div>
    );

    const totalIncome = cashFlowData.reduce((acc, curr) => acc + curr.income, 0);
    const totalExpense = cashFlowData.reduce((acc, curr) => acc + curr.expense, 0);
    const netSavings = totalIncome - totalExpense;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Financial Intelligence</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time analytics and liquidity forecasting.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1e293b] hover:bg-slate-50 dark:hover:bg-[#253045] text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-slate-200 dark:border-white/5 shadow-sm"
                    >
                        <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                        <span className="font-medium text-sm">Export Report</span>
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BurnRateCard data={burnRate} />

                <KPI_Card
                    title="Total Income (6m)"
                    amount={totalIncome}
                    icon={<TrendingUp className="text-emerald-400" />}
                    trend="+12% vs prev"
                    color="emerald"
                />

                <KPI_Card
                    title="Total Expense (6m)"
                    amount={totalExpense}
                    icon={<TrendingDown className="text-rose-400" />}
                    trend="-5% vs prev"
                    color="rose"
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cash Flow Chart (Span 2) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-rose-500/5 opacity-50 pointer-events-none" />

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cash Flow</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Income vs Expenses over time</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-emerald-400 font-medium">Income</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-rose-400 font-medium">Expense</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#64748b"
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={val => `Rs. ${val / 1000}k`}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--tooltip-bg)',
                                        borderColor: 'var(--tooltip-border)',
                                        color: 'var(--tooltip-text)',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                    }}
                                    itemStyle={{ padding: '2px 0' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    name="Income"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    destination="colorIncome"
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    name="Expense"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Expense Categories (Span 1) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-xl flex flex-col"
                >
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Spending Mix</h3>

                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseCategories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="amount"
                                    stroke="none"
                                >
                                    {expenseCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', borderRadius: '12px' }}
                                    formatter={(val) => `Rs. ${val.toLocaleString()}`}
                                    itemStyle={{ color: 'var(--tooltip-text)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total</span>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">Rs. {cashFlowData.reduce((acc, c) => acc + c.expense, 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3 overflow-y-auto max-h-[200px] custom-scrollbar pr-2">
                        {expenseCategories.map((cat, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">{cat.category}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-slate-900 dark:text-white font-bold text-sm">Rs. {cat.amount.toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">{cat.percentage}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Top Merchants Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-xl"
            >
                <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Top Merchants</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 text-xs font-bold border border-indigo-500/20">Monthly</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topMerchants.map((merchant, index) => (
                        <div key={index} className="group relative bg-slate-50 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-900/20 shadow-sm">
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight size={14} className="text-slate-400 dark:text-slate-500" />
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-4 font-black text-xl shadow-inner border border-indigo-500/10 dark:border-white/5">
                                {merchant.name.charAt(0)}
                            </div>
                            <h4 className="text-slate-900 dark:text-slate-200 font-semibold truncate w-full" title={merchant.name}>{merchant.name}</h4>
                            <div className="text-slate-900 dark:text-white font-bold text-lg mt-1">Rs. {merchant.amount.toLocaleString()}</div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700/50 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${merchant.percentage}%` }}
                                />
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1.5 text-right">{merchant.percentage}% split</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

function KPI_Card({ title, amount, icon, trend, color }) {
    const isPos = trend.startsWith('+');

    return (
        <div className="bg-white dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-6 rounded-3xl relative overflow-hidden group shadow-sm">
            <div className={`absolute inset-0 bg-gradient-to-br ${color === 'emerald' ? 'from-emerald-500/10' : 'from-rose-500/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${color === 'emerald' ? 'bg-emerald-500/10' : 'bg-rose-500/10'} border ${color === 'emerald' ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                    {icon}
                </div>
            </div>

            <div className="relative z-10">
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    Rs. {amount.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPos ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} border ${isPos ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                        {trend}
                    </span>
                    <span className="text-xs text-slate-500">since last month</span>
                </div>
            </div>
        </div>
    );
}

function BurnRateCard({ data }) {
    if (!data) return null;

    const isCritical = data.status === 'Critical';
    const isWarning = data.status === 'Warning';

    // Status color mapping
    const statusColor = isCritical ? 'rose' : isWarning ? 'amber' : 'indigo';
    const statusBg = isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500';
    const statusText = isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-indigo-400';

    return (
        <div className="bg-white dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-6 rounded-3xl relative overflow-hidden group shadow-sm">
            <div className={`absolute inset-0 bg-gradient-to-br from-${statusColor}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monthly Burn Rate</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Health: {data.status}</p>
                </div>
                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 ${statusText}`}>
                    {isCritical ? <AlertTriangle size={20} /> : <Activity size={20} />}
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Rs. {data.current_burn_rate.toLocaleString()}</span>
                    <span className="text-sm text-slate-500 font-medium">/ mo</span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Runway Left</span>
                        <span className={`text-xs font-bold ${statusText}`}>{data.runway_months > 99 ? '99+' : data.runway_months} Months</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${statusBg} transition-all duration-1000 ease-out`}
                            style={{ width: `${Math.min(data.runway_months * 5, 100)}%` }}
                        />
                    </div>
                    <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 flex justify-between">
                        <span>Avg: Rs. {data.average_burn_rate.toLocaleString()}</span>
                        <span>Safe &gt; 6m</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
