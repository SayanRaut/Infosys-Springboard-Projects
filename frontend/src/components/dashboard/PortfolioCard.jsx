import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiBriefcase } from 'react-icons/fi';

export default function PortfolioCard({ totalBalance, user, rewards }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white to-indigo-50 dark:from-[#1A1F37] dark:to-[#0f1222] p-4 text-center border border-indigo-100 dark:border-indigo-500/20 shadow-2xl flex flex-col justify-between h-full"
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 dark:bg-violet-600/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3"></div>

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3 py-1 rounded-full mb-4">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-300 uppercase">
                        {rewards?.points !== undefined ? `${rewards.points.toLocaleString()} PTS` : 'Pro Portfolio'}
                    </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                    Net Worth
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed max-w-[200px] mx-auto">
                    Your aggregated financial portfolio.
                </p>

                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 tracking-tighter mb-6">
                    Rs. {Number(totalBalance).toLocaleString()}
                </h2>
            </div>

            <div className="relative z-10 space-y-2.5">
                <Link to="/dashboard/accounts" className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/40 hover:scale-[1.02] hover:shadow-indigo-500/50 dark:hover:shadow-indigo-900/60 transition-all flex items-center justify-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    <span>Manage Accounts</span>
                </Link>
                <Link to="/dashboard/rewards" className="w-full py-3 rounded-xl bg-white dark:bg-[#0B1019]/50 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-[#0B1019] hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2">
                    <FiBriefcase className="w-3 h-3" />
                    <span>Rewards Center</span>
                </Link>
            </div>
        </motion.div>
    );
}
