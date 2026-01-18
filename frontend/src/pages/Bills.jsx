import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiClock, FiPlus, FiX, FiCalendar, FiTrash2, FiChevronRight, FiLoader } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'sonner';

export default function Bills() {
    const [bills, setBills] = useState([]);
    const [summary, setSummary] = useState({
        active_count: 0,
        due_amount: 0,
        upcoming_count: 0,
        overdue_amount: 0,
        overdue_count: 0,
        paid_count: 0
    });
    // Helper to safely format amounts
    const safeAmount = (amount) => Number(amount || 0).toFixed(2);
    const [accounts, setAccounts] = useState([]);
    const [billToPay, setBillToPay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);
    const [billToAutoPay, setBillToAutoPay] = useState(null);

    const fetchData = async () => {
        try {
            const [billsRes, summaryRes, accountsRes] = await Promise.all([
                api.get('/bills/all'),
                api.get('/bills/summary'),
                api.get('/accounts/')
            ]);
            setBills(billsRes.data.sort((a, b) => a.id - b.id)); // Stable sort by ID
            setSummary(summaryRes.data);
            setAccounts(accountsRes.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load bills");
        } finally {
            setLoading(false);
        }
    };

    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get("highlight");

    useEffect(() => {
        fetchData();
    }, []);

    // Scroll to highlight
    useEffect(() => {
        if (highlightId && !loading && bills.length > 0) {
            const element = document.getElementById(`bill-${highlightId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [highlightId, loading, bills]);

    const handlePayClick = (bill) => {
        setBillToPay(bill);
    };

    const handlePaymentComplete = async (accountId) => {
        if (!billToPay) return;
        try {
            await api.put(`/bills/${billToPay.id}/pay?account_id=${accountId}`);
            toast.success("Bill paid successfully!");
            fetchData();
            // Don't close immediately if we want to show success in modal, but let's close for now or let modal handle it?
            // If I return true here, modal can show success.
            return true;
        } catch (error) {
            toast.error("Failed to pay bill");
            return false;
        } finally {
            // setBillToPay(null); // Move this responsibility to modal for better UX
        }
    };

    const confirmDelete = async () => {
        if (!billToDelete) return;
        try {
            await api.delete(`/bills/${billToDelete.id}`);
            toast.success("Bill deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete bill");
        } finally {
            setBillToDelete(null);
        }
    };

    const handleDeleteClick = (bill) => {
        setBillToDelete(bill);
    };

    const handleAutoPayToggle = async (bill) => {
        // If enabling auto-pay, open modal to select time
        if (!bill.auto_pay) {
            setBillToAutoPay(bill);
            return;
        }

        // If disabling, just do it immediately
        try {
            await api.patch(`/bills/${bill.id}`, { auto_pay: false, auto_pay_time: null });
            toast.success("Auto-pay disabled");
            fetchData();
        } catch (error) {
            toast.error("Failed to disable auto-pay");
        }
    };

    const confirmAutoPay = async (time) => {
        if (!billToAutoPay) return;
        try {
            await api.patch(`/bills/${billToAutoPay.id}`, {
                auto_pay: true,
                auto_pay_time: time
            });
            toast.success(`Auto-pay scheduled for ${time}`);
            fetchData();
        } catch (error) {
            toast.error("Failed to enable auto-pay");
        } finally {
            setBillToAutoPay(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'text-emerald-400 bg-emerald-400/10';
            case 'overdue': return 'text-rose-400 bg-rose-400/10';
            default: return 'text-amber-400 bg-amber-400/10';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-2">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Bills & Payments</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your recurring bills and payments.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all"
                >
                    <FiPlus className="w-5 h-5" /> Add Bill
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between h-32 shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Bills</span>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{summary.active_count}</h3>
                        <p className="text-xs text-slate-500 mt-1">Active bills</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between h-32 shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium flex justify-between">Due Soon <FiClock className="text-amber-500" /></span>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Rs. {safeAmount(summary.due_amount)}</h3>
                        <p className="text-xs text-amber-500/80 mt-1">{summary.upcoming_count} upcoming</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between h-32 shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium flex justify-between">Overdue <FiAlertCircle className="text-rose-500" /></span>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Rs. {safeAmount(summary.overdue_amount)}</h3>
                        <p className="text-xs text-rose-500/80 mt-1">{summary.overdue_count} overdue</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between h-32 shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium flex justify-between">Paid This Month <FiCheckCircle className="text-emerald-500" /></span>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{summary.paid_count}</h3>
                        <p className="text-xs text-emerald-500/80 mt-1">Bills paid</p>
                    </div>
                </div>
            </div>



            {/* OVERDUE BILLS ALERT SECTION */}
            {
                bills.some(b => b.status !== 'paid' && new Date(b.due_date) < new Date().setHours(0, 0, 0, 0)) && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiAlertCircle className="text-rose-500" /> Overdue Bills
                        </h3>
                        <div className="bg-white dark:bg-[#1e293b]/40 border border-slate-200 dark:border-rose-500/20 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg shadow-rose-900/10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-rose-500/10 text-rose-500/80 text-sm uppercase tracking-wider bg-rose-50 dark:bg-rose-500/5">
                                        <th className="p-6 font-medium">Status</th>
                                        <th className="p-6 font-medium">Biller</th>
                                        <th className="p-6 font-medium">Due Date</th>
                                        <th className="p-6 font-medium">Amount</th>
                                        <th className="p-6 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-900 dark:text-slate-200 divide-y divide-rose-500/10">
                                    {bills
                                        .filter(b => b.status !== 'paid' && new Date(b.due_date) < new Date().setHours(0, 0, 0, 0))
                                        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                                        .map(bill => {
                                            const daysOverdue = Math.ceil((new Date() - new Date(bill.due_date)) / (1000 * 60 * 60 * 24));
                                            return (
                                                <motion.tr
                                                    key={bill.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="hover:bg-rose-500/5 transition-colors group"
                                                >
                                                    <td className="p-6">
                                                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-rose-400 bg-rose-400/10">
                                                            <FiAlertCircle className="w-5 h-5" />
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="font-semibold text-lg text-slate-900 dark:text-white">{bill.biller_name}</div>
                                                        <div className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-bold">Overdue by {daysOverdue} days</div>
                                                    </td>
                                                    <td className="p-6 text-slate-500 dark:text-slate-400 font-mono">{new Date(bill.due_date).toLocaleDateString()}</td>
                                                    <td className="p-6 font-bold text-lg text-rose-600 dark:text-rose-100">Rs. {bill.amount_due.toFixed(2)}</td>
                                                    <td className="p-6 text-right">
                                                        <button
                                                            onClick={() => handlePayClick(bill)}
                                                            className="px-5 py-2 text-sm font-bold bg-rose-500 text-rose-950 rounded-lg hover:bg-rose-400 transition-all shadow-lg shadow-rose-900/20 active:scale-95"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {/* UPCOMING BILLS ALERT SECTION */}
            {
                bills.some(b => b.status === 'upcoming' && Math.ceil((new Date(b.due_date) - new Date()) / (1000 * 60 * 60 * 24)) <= 7) && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiAlertCircle className="text-amber-500" /> Upcoming Bills (Next 7 Days)
                        </h3>
                        <div className="bg-white dark:bg-[#1e293b]/40 border border-slate-200 dark:border-amber-500/20 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg shadow-amber-900/10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-amber-500/10 text-amber-500/80 text-sm uppercase tracking-wider bg-amber-50 dark:bg-amber-500/5">
                                        <th className="p-6 font-medium">Status</th>
                                        <th className="p-6 font-medium">Biller</th>
                                        <th className="p-6 font-medium">Due Date</th>
                                        <th className="p-6 font-medium">Amount</th>
                                        <th className="p-6 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-900 dark:text-slate-200 divide-y divide-amber-500/10">
                                    {bills
                                        .filter(b => b.status === 'upcoming' && Math.ceil((new Date(b.due_date) - new Date()) / (1000 * 60 * 60 * 24)) <= 7)
                                        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                                        .map(bill => {
                                            const daysDiff = Math.ceil((new Date(bill.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                                            return (
                                                <motion.tr
                                                    key={bill.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="hover:bg-amber-500/5 transition-colors group"
                                                >
                                                    <td className="p-6">
                                                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-amber-400 bg-amber-400/10">
                                                            <FiClock className="w-5 h-5" />
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="font-semibold text-lg text-slate-900 dark:text-white">{bill.biller_name}</div>
                                                        <div className="text-xs text-amber-500 dark:text-amber-400 mt-1 font-bold">Due in {daysDiff} days</div>
                                                    </td>
                                                    <td className="p-6 text-slate-500 dark:text-slate-400 font-mono">{new Date(bill.due_date).toLocaleDateString()}</td>
                                                    <td className="p-6 font-bold text-lg text-amber-600 dark:text-amber-100">Rs. {bill.amount_due.toFixed(2)}</td>
                                                    <td className="p-6 text-right">
                                                        <button
                                                            onClick={() => handlePayClick(bill)}
                                                            className="px-5 py-2 text-sm font-bold bg-amber-500 text-amber-950 rounded-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-900/20 active:scale-95"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">All Bills</h3>
            <div className="bg-white dark:bg-[#1e293b]/40 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden backdrop-blur-md shadow-l sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider bg-slate-50 dark:bg-white/5">
                            <th className="p-6 font-medium">Status</th>
                            <th className="p-6 font-medium">Biller</th>
                            <th className="p-6 font-medium">Due Date</th>
                            <th className="p-6 font-medium">Auto-Pay</th>
                            <th className="p-6 font-medium">Amount</th>
                            <th className="p-6 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-900 dark:text-slate-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="relative mb-4">
                                            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FiLoader className="text-emerald-500 animate-pulse w-6 h-6" />
                                            </div>
                                        </div>
                                        <p className="text-slate-500 animate-pulse font-medium tracking-wide">LOADING BILLS...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : bills.length === 0 ? (
                            <tr><td colSpan="6" className="p-10 text-center text-slate-500">No bills found. Add one to get started!</td></tr>
                        ) : bills.map((bill, idx) => {
                            const isUpcoming = bill.status === 'upcoming';
                            const daysDiff = Math.ceil((new Date(bill.due_date) - new Date()) / (1000 * 60 * 60 * 24));

                            // Highlight Logic
                            const isHighlighted = highlightId && String(bill.id) === highlightId;

                            return (
                                <motion.tr
                                    layout
                                    id={`bill-${bill.id}`}
                                    key={bill.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`border-b border-slate-200 dark:border-white/5 last:border-0 transition-colors group relative ${isHighlighted ? 'z-10' : ''}`}
                                >
                                    <td className="p-6">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(bill.status)}`}>
                                            {bill.status === 'paid' && <FiCheckCircle className="w-5 h-5" />}
                                            {bill.status === 'overdue' && <FiAlertCircle className="w-5 h-5" />}
                                            {bill.status === 'upcoming' && <FiClock className="w-5 h-5" />}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-semibold text-lg">{bill.biller_name}</div>
                                        {bill.status === 'upcoming' && (
                                            <div className="text-xs text-slate-400 mt-1">Due in {daysDiff} days</div>
                                        )}
                                        {bill.status === 'overdue' && (
                                            <div className="text-xs text-rose-400 mt-1">{Math.abs(daysDiff)} days overdue</div>
                                        )}
                                        {bill.status === 'paid' && (
                                            <div className="text-xs text-emerald-400 mt-1">Payment complete</div>
                                        )}
                                    </td>
                                    <td className="p-6 text-slate-500 dark:text-slate-400 font-mono">{new Date(bill.due_date).toLocaleDateString()}</td>
                                    <td className="p-6">
                                        <div
                                            onClick={() => handleAutoPayToggle(bill)}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${bill.auto_pay ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${bill.auto_pay ? 'translate-x-6' : ''}`} />
                                        </div>
                                        {bill.auto_pay && bill.auto_pay_time && (
                                            <div className="text-xs text-emerald-400 mt-1 font-mono">
                                                at {bill.auto_pay_time}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-6 font-bold text-lg">Rs. {bill.amount_due.toFixed(2)}</td>
                                    <td className="p-6 text-right">
                                        {bill.status !== 'paid' ? (
                                            <div className="flex justify-end items-center gap-3">
                                                <button
                                                    onClick={() => handlePayClick(bill)}
                                                    className="px-5 py-2 text-sm font-bold bg-emerald-500 text-emerald-950 rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                                                >
                                                    Pay Now
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(bill)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Delete Bill"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end items-center gap-3">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Paid
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteClick(bill)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Delete Bill"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </motion.tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <AddBillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchData();
                    setIsModalOpen(false);
                    toast.success("Bill added successfully");
                }}
            />

            <DeleteConfirmationModal
                isOpen={!!billToDelete}
                onClose={() => setBillToDelete(null)}
                onConfirm={confirmDelete}
                billName={billToDelete?.biller_name}
            />

            <AutoPayTimeModal
                isOpen={!!billToAutoPay}
                onClose={() => setBillToAutoPay(null)}
                onConfirm={confirmAutoPay}
                billName={billToAutoPay?.biller_name}
            />

            <PaymentModal
                isOpen={!!billToPay}
                onClose={() => setBillToPay(null)}
                bill={billToPay}
                accounts={accounts}
                onConfirm={handlePaymentComplete}
            />
        </div >
    );
}

function PaymentModal({ isOpen, onClose, bill, accounts, onConfirm }) {
    const [selectedAccount, setSelectedAccount] = useState('');
    const [pin, setPin] = useState('');
    const [paymentStage, setPaymentStage] = useState('input'); // input, processing, success
    const [slideReset, setSlideReset] = useState(false);

    useEffect(() => {
        if (isOpen && accounts.length > 0) {
            setSelectedAccount(accounts[0].id);
            setPaymentStage('input');
            setPin('');
            setSlideReset(prev => !prev);
        }
    }, [isOpen, accounts]);

    const handleSlideComplete = async () => {
        if (pin.length < 4) {
            toast.error("Please enter a valid 4-digit PIN");
            setSlideReset(prev => !prev); // Reset slider
            return;
        }

        setPaymentStage('processing');

        try {
            // 1. Verify PIN
            const verifyRes = await api.post(`/accounts/${selectedAccount}/verify-pin?pin=${pin}`);
            if (verifyRes.data !== true) {
                throw new Error("Invalid PIN");
            }

            // 2. Process Payment via Parent Callback
            const success = await onConfirm(selectedAccount);

            if (success) {
                setPaymentStage('success');
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setPaymentStage('input');
                setSlideReset(prev => !prev);
            }

        } catch (error) {
            console.error(error);
            if (error.message === 'Invalid PIN') {
                toast.error("Incorrect PIN. Please try again.");
            } else {
                toast.error("Payment failed. Please try again.");
            }
            setPaymentStage('input');
            setPin('');
            setSlideReset(prev => !prev);
        }
    };

    if (!bill) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {paymentStage === 'success' ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        backgroundPosition: ["0% 50%", "100% 50%"]
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        opacity: { duration: 0.2 },
                                        scale: { type: "spring", stiffness: 200, damping: 20 },
                                        backgroundPosition: { duration: 3, repeat: Infinity, repeatType: "reverse" }
                                    }}
                                    style={{
                                        background: "linear-gradient(135deg, #fbbf24, #10b981, #34d399)",
                                        backgroundSize: "200% 200%"
                                    }}
                                    className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                                        className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-xl"
                                    >
                                        <FiCheckCircle className="w-12 h-12 text-white" />
                                    </motion.div>
                                    <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Success!</h3>
                                    <p className="text-white/90 font-medium text-lg drop-shadow-md">
                                        Successfully paid the bill
                                    </p>
                                    <p className="text-white/80 text-sm mt-2">
                                        Rs. {bill.amount_due} to {bill.biller_name}
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="input"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-6"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Make Payment</h3>
                                        <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><FiX className="w-5 h-5" /></button>
                                    </div>

                                    {/* Bill Info */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
                                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">To</div>
                                        <div className="text-lg font-bold text-slate-900 dark:text-white mb-2">{bill.biller_name}</div>
                                        <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-700 pt-3">
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">Amount</span>
                                            <span className="text-2xl font-bold text-emerald-400">Rs. {bill.amount_due}</span>
                                        </div>
                                    </div>

                                    {/* Account Selection */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Pay From</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                            value={selectedAccount}
                                            onChange={(e) => setSelectedAccount(e.target.value)}
                                        >
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.bank_name} (...{acc.masked_account}) - Rs. {Number(acc.balance).toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* PIN Input */}
                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Enter 4-Digit PIN</label>
                                        <div className="flex justify-center gap-3">
                                            {[0, 1, 2, 3].map((_, i) => (
                                                <input
                                                    key={i}
                                                    id={`pin-${i}`}
                                                    type="password"
                                                    maxLength="1"
                                                    className="w-12 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-900 dark:text-white text-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                    value={pin[i] || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (!/^\d*$/.test(val)) return;

                                                        const newPin = pin.split('');
                                                        newPin[i] = val;
                                                        const joined = newPin.join('');
                                                        setPin(joined);

                                                        // Auto focus next
                                                        if (val && i < 3) document.getElementById(`pin-${i + 1}`).focus();
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace' && !pin[i] && i > 0) {
                                                            document.getElementById(`pin-${i - 1}`).focus();
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Slider */}
                                    <div className="relative h-16 bg-slate-200 dark:bg-slate-800 rounded-full p-1 overflow-hidden group shadow-inner">
                                        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pointer-events-none">
                                            Slide to Pay
                                        </div>
                                        <SliderButton
                                            onConfirm={handleSlideComplete}
                                            disabled={paymentStage === 'processing'}
                                            color="bg-emerald-500"
                                            icon={<FiCheckCircle className="w-5 h-5 text-white" />}
                                            reset={slideReset}
                                        />
                                    </div>

                                    {paymentStage === 'processing' && (
                                        <div className="mt-4 text-center text-emerald-400 text-sm font-medium">
                                            Processing Payment...
                                        </div>
                                    )}

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Updated SliderButton to be reusable
function SliderButton({ onConfirm, disabled, color = "bg-rose-500", icon, reset }) {
    const x = useMotionValue(0);
    const backgroundOpacity = useTransform(x, [0, 250], [0, 1]); // Adjust opacity based on slide
    // Actually for color fill, we want width
    // Let's us a simple opacity overlay or width change

    // Better: background color reveal
    const [dragEnded, setDragEnded] = useState(false);

    useEffect(() => {
        if (reset !== undefined) {
            x.set(0);
            setDragEnded(false);
        }
    }, [reset, x]);

    const handleDragEnd = (_, info) => {
        if (info.offset.x > 220) { // Threshold
            setDragEnded(true);
            onConfirm();
        } else {
            // Snap back handled by dragConstraints usually, but we can force it
        }
    };

    return (
        <div className="relative w-full h-full rounded-full bg-slate-100 dark:bg-slate-800/50">
            {/* Fill Background on Slide */}
            <motion.div
                style={{ opacity: backgroundOpacity, width: '100%' }} // Simple opacity fade
                className={`absolute inset-0 ${color} rounded-full`}
            />

            <motion.div
                drag={!disabled && !dragEnded ? "x" : false}
                dragConstraints={{ left: 0, right: 260 }}
                dragElastic={0.05}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                style={{ x }} // Bind x
                className="absolute left-1 top-1 bottom-1 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {disabled || dragEnded ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={color === "bg-rose-500" ? "text-rose-500" : "text-emerald-500"}
                    >
                        {icon || <FiTrash2 className="w-5 h-5" />}
                    </motion.div>
                ) : (
                    <FiChevronRight className="w-6 h-6 text-slate-900" />
                )}
            </motion.div>
        </div>
    );
}

function AutoPayTimeModal({ isOpen, onClose, onConfirm, billName }) {
    const [time, setTime] = useState('09:00'); // Default time

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(time);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FiClock className="w-5 h-5 text-emerald-500" /> Set Auto-Pay Time
                            </h3>
                            <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><FiX className="w-5 h-5" /></button>
                        </div>

                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                            Select the time of day you want <span className="text-slate-900 dark:text-white font-semibold">{billName}</span> to be automatically paid on the due date.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="relative mb-6">
                                <input
                                    type="time"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-center text-lg tracking-widest font-mono"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    required
                                />
                                <FiClock className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Schedule Auto-Pay
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, billName }) {
    const [confirmed, setConfirmed] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setConfirmed(false);
            setShowSuccess(false);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        setConfirmed(true);
        // Show success state
        setTimeout(() => {
            setShowSuccess(true);

            // Wait for success animation then actually delete
            setTimeout(() => {
                onConfirm();
            }, 1500);
        }, 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {!showSuccess ? (
                                <motion.div
                                    key="confirm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-8 text-center relative"
                                >
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        <FiX className="w-6 h-6" />
                                    </button>

                                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FiTrash2 className="w-8 h-8 text-rose-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Delete Bill?</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                                        Do you really want to delete <span className="text-slate-900 dark:text-white font-semibold">{billName}</span>? This action cannot be undone.
                                    </p>

                                    <div className="relative h-14 bg-slate-200 dark:bg-slate-800 rounded-full p-1 overflow-hidden group">
                                        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest pointer-events-none">
                                            Slide to Delete
                                        </div>
                                        <SliderButton onConfirm={handleConfirm} disabled={confirmed} />
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="mt-6 text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20
                                        }}
                                        className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
                                    >
                                        <FiCheckCircle className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                                    <p className="text-emerald-400 font-medium">
                                        Successfully deleted the bill
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}



function AddBillModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        biller_name: '',
        due_date: '',
        amount_due: '',
        auto_pay: false,
        auto_pay_time: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                amount_due: parseFloat(formData.amount_due),
                auto_pay_time: formData.auto_pay && formData.auto_pay_time ? formData.auto_pay_time : null
            };
            await api.post('/bills/', payload);
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to add bill");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FiPlus className="w-5 h-5 text-emerald-500" /> Add New Bill
                            </h3>
                            <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><FiX className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Biller Name</label>
                                <input
                                    type="text" placeholder="e.g. Netflix, Rent, Electric"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={formData.biller_name}
                                    onChange={e => setFormData({ ...formData, biller_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Due Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={formData.due_date}
                                            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                            required
                                        />
                                        <FiCalendar className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Amount Due (Rs.)</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.01" placeholder="0.00"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 pl-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={formData.amount_due}
                                            onChange={e => setFormData({ ...formData, amount_due: e.target.value })}
                                            required
                                        />
                                        <span className="absolute left-3 top-3.5 text-slate-500 font-bold text-sm pointer-events-none">Rs.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                <input
                                    type="checkbox"
                                    id="autopay"
                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-white dark:bg-slate-700"
                                    checked={formData.auto_pay}
                                    onChange={e => setFormData({ ...formData, auto_pay: e.target.checked })}
                                />
                                <label htmlFor="autopay" className="text-sm text-slate-600 dark:text-slate-300">Enable Auto-Pay for this bill</label>
                            </div>

                            {formData.auto_pay && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="overflow-hidden"
                                >
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Auto-Pay Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={formData.auto_pay_time}
                                            onChange={e => setFormData({ ...formData, auto_pay_time: e.target.value })}
                                            required
                                        />
                                        <FiClock className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                                    </div>
                                </motion.div>
                            )}

                            <button
                                type="submit" disabled={isSubmitting}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 rounded-lg mt-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                            >
                                {isSubmitting ? 'Adding Bill...' : 'Add Bill'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
