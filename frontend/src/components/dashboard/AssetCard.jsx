import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

export default function AssetCard({ account, index }) {
    // Generate pseudo-random chart data based on balance to make it look unique but deterministic
    const generateData = (seed) => {
        let data = [];
        let val = seed / 100;
        for (let i = 0; i < 20; i++) {
            val = val + (Math.random() - 0.5) * 10;
            if (val < 0) val = 10;
            data.push({ value: val });
        }
        return data;
    };

    const data = generateData(Number(account.balance));

    // Theme colors based on index/type
    const themes = [
        { color: '#10b981', gradient: 'from-emerald-500/20 to-emerald-500/0', stroke: '#10b981', name: 'Emerald' }, // Savings
        { color: '#f59e0b', gradient: 'from-amber-500/20 to-amber-500/0', stroke: '#f59e0b', name: 'Amber' },     // Checking
        { color: '#8b5cf6', gradient: 'from-violet-500/20 to-violet-500/0', stroke: '#8b5cf6', name: 'Violet' },   // Investment
        { color: '#ec4899', gradient: 'from-pink-500/20 to-pink-500/0', stroke: '#ec4899', name: 'Pink' },       // Other
    ];
    const theme = themes[index % themes.length];

    const isPositive = Math.random() > 0.3; // Mock trend for now
    const percent = (Math.random() * 5 + 1).toFixed(2);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-white/5 p-3 shadow-xl hover:border-emerald-500/20 dark:hover:border-white/10 transition-colors group"
        >
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[50px] opacity-20 bg-${theme.name.toLowerCase()}-500 pointer-events-none`}></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-${theme.name.toLowerCase()}-500/10 flex items-center justify-center border border-${theme.name.toLowerCase()}-500/20`}>
                        {/* Simple icon based on name first letter or generic */}
                        <span className={`text-sm font-bold text-${theme.name.toLowerCase()}-500 dark:text-${theme.name.toLowerCase()}-400`}>{(account.type || 'Asset').charAt(0)}</span>
                    </div>
                    <div>
                        <p className="text-slate-900 dark:text-white text-sm font-semibold tracking-tight">{account.account_name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">{(account.account_number || '****').slice(-4)} • {account.type || 'Asset'}</p>
                    </div>
                </div>

                {/* External Link Arrow */}
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-white group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors cursor-pointer">
                    <FiArrowUpRight size={12} />
                </div>
            </div>

            {/* Balance */}
            <div className="mb-1">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5 font-medium">Available Balance</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Rs. {Number(account.balance).toLocaleString()}</h3>
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <FiArrowUpRight size={10} /> : <FiArrowDownRight size={10} />}
                    <span>{percent}%</span>
                </div>
            </div>

            {/* Sparkline Chart */}
            <div className="h-20 w-full -mx-2 -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={theme.color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={theme.stroke}
                            strokeWidth={2}
                            fill={`url(#gradient-${index})`}
                            isAnimationActive={true}
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-white/10 p-2 rounded-lg shadow-xl">
                <p className="text-slate-900 dark:text-white font-bold text-xs">
                    Rs. {Number(payload[0].value).toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
}
