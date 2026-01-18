import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSearch } from 'react-icons/fi';

// New Components
import AssetCard from '../components/dashboard/AssetCard';
import PortfolioCard from '../components/dashboard/PortfolioCard';
import DetailedActivityCard from '../components/dashboard/DetailedActivityCard';

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState({
        accounts: [],
        transactions: [],
        bills: [],
        budgets: [],
        rewards: { points: 0 },
        balanceHistory: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // API Calls
                const [acc, txn, billsRes, budgetsRes, rewardsRes, summaryRes] = await Promise.all([
                    api.get('/accounts/'),
                    api.get('/transactions/all'),
                    api.get('/bills/all'),
                    api.get('/budgets/'),
                    api.get('/rewards/balance'),
                    api.get('/budgets/summary') // Optional: simple summary
                ]);

                // Mock History (Replace with real if endpoint exists later)
                const mockHistory = [
                    { date: 'Jan', balance: 4000 }, { date: 'Feb', balance: 3200 },
                    { date: 'Mar', balance: 5000 }, { date: 'Apr', balance: 4500 },
                    { date: 'May', balance: 8000 }, { date: 'Jun', balance: 7200 },
                    { date: 'Jul', balance: 9000 },
                ];

                setData({
                    accounts: acc.data || [],
                    transactions: txn.data || [],
                    bills: billsRes.data || [],
                    budgets: budgetsRes.data || [],
                    rewards: rewardsRes.data || { points: 0 },
                    balanceHistory: mockHistory
                });
            } catch (e) {
                console.error("Failed to load dashboard data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalBalance = data.accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1019] transition-colors duration-300">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1019] text-slate-900 dark:text-slate-100 p-6 lg:p-10 font-sans selection:bg-emerald-500/30 transition-colors duration-300">

            {/* TOP HEADER - Right Aligned (Bell, Settings, Profile) */}


            {/* FILTERS & STATS ROW (Now aligned with screenshot layout below header) */}
            <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Placeholder for left align (or empty) - Screenshot showed filters centered/rightish? 
                     Actually screenshot showed filters isolated. Let's keep them right aligned or center?
                     User screenshot shows them clearly floating. Let's arrange them nicely. */}
                <div></div> {/* Spacer */}

                {/* Filter Pills */}
                <div className="flex gap-4">
                    {['24H', 'Proof of Stake', 'Desc'].map(filter => (
                        <button key={filter} className="px-5 py-2 rounded-2xl bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-white/5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-lg shadow-black/5">
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Divider/Spacer before grid */}
            <div className="mb-8"></div>


            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">

                {/* 1. ASSET CARDS (Takes up 3 columns) */}
                <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.accounts.map((account, index) => (
                        <AssetCard key={account.id} account={account} index={index} />
                    ))}
                    {/* Fallback if no accounts */}
                    {data.accounts.length === 0 && (
                        <div className="col-span-3 p-8 rounded-3xl bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-white/5 border-dashed flex flex-col items-center justify-center text-slate-500">
                            <p>No investment accounts found.</p>
                            <button className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm">Create One</button>
                        </div>
                    )}
                </div>

                {/* 2. PORTFOLIO CARD (Takes up 1 column) */}
                <div className="xl:col-span-1">
                    <PortfolioCard totalBalance={totalBalance} user={user} rewards={data.rewards} />
                </div>
            </div>

            {/* 3. DETAILED ACTIVITY SECTION (Financial Insights) */}
            <DetailedActivityCard
                transactions={data.transactions}
                bills={data.bills}
                budgets={data.budgets}
                balanceHistory={data.balanceHistory}
            />

        </div>
    );
}
