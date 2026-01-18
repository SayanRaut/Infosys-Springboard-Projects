import React from 'react';
import { motion } from 'framer-motion';

export default function TransactionTable({ transactions }) {
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400';
            case 'Pending': return 'bg-amber-500/10 text-amber-400';
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    return (
        <div className="bg-[#1e293b]/60 border border-white/5 rounded-3xl p-6 backdrop-blur-sm overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-100">Transaction History</h3>
                <button className="text-sm text-blue-400 font-medium hover:text-blue-300">View All</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-slate-400 text-sm border-b border-white/5">
                            <th className="pb-4 font-medium pl-2">Name</th>
                            <th className="pb-4 font-medium">Date</th>
                            <th className="pb-4 font-medium">Type</th>
                            <th className="pb-4 font-medium">Amount</th>
                            <th className="pb-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-200">
                        {transactions.map((txn, i) => (
                            <motion.tr
                                key={txn.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                            >
                                <td className="py-4 pl-2">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${txn.merchant}&background=random`}
                                            className="w-10 h-10 rounded-full"
                                            alt="avatar"
                                        />
                                        <span className="font-semibold">{txn.merchant}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-slate-400 text-sm">
                                    {new Date(txn.txn_date).toLocaleDateString()} <br />
                                    <span className="text-xs opacity-60">{new Date(txn.txn_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </td>
                                <td className="py-4 text-sm text-slate-300">{txn.category}</td>
                                <td className={`py-4 font-bold ${txn.txn_type === 'credit' ? 'text-emerald-400' : 'text-slate-100'}`}>
                                    {txn.txn_type === 'credit' ? '+' : '-'}Rs. {Math.abs(txn.amount)}
                                </td>
                                <td className="py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle('Completed')}`}>
                                        Completed
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}