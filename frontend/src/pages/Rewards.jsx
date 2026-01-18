import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift, FiStar, FiCreditCard, FiShoppingBag, FiInfo, FiCheckCircle, FiLoader, FiZap } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'sonner';

export default function Rewards() {
    const [balance, setBalance] = useState({ points: 0, program: "Blue" });
    const [exchangeRate, setExchangeRate] = useState(null);
    const [myRewards, setMyRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(null); // Item ID being redeemed

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const [balanceRes, rateRes, rewardsRes] = await Promise.all([
                api.get('/rewards/balance'),
                api.get('/rewards/exchange-rate'),
                api.get('/rewards/my-rewards')
            ]);

            setBalance({
                points: balanceRes.data.points_balance,
                program: balanceRes.data.program_name
            });
            setExchangeRate(rateRes.data);
            setMyRewards(rewardsRes.data);
        } catch (error) {
            console.error("Failed to fetch rewards", error);
        } finally {
            setLoading(false);
        }
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const handleRedeem = async (item) => {
        if (balance.points < item.cost) {
            toast.error("Insufficient points balance");
            return;
        }

        setRedeeming(item.id);
        try {
            const res = await api.post('/rewards/redeem', {
                item_id: item.id,
                item_name: item.name,
                cost: item.cost,
                type: item.type
            });

            if (res.data.success) {
                // toast.success(`Redeemed: ${item.name}!`, { icon: '🎁' });
                setSuccessData({ name: item.name, balance: res.data.new_balance });
                setShowSuccessModal(true);
                // Update local balance
                setBalance(prev => ({ ...prev, points: res.data.new_balance }));
                // Refresh rewards list if it wasn't cashback
                if (item.type !== 'cashback') fetchBalance();
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || "Redemption failed");
        } finally {
            setRedeeming(null);
        }
    };

    if (loading) return null;

    const GIFT_CARDS = [
        { id: 'gc_amazon_500', name: 'Amazon Gift Card Rs. 50', cost: 500, type: 'giftcard', icon: FiShoppingBag, color: 'text-amber-500' },
        { id: 'gc_google_1000', name: 'Google Play Rs. 100', cost: 1000, type: 'giftcard', icon: FiCreditCard, color: 'text-blue-500' },
        { id: 'sub_spotify_1500', name: 'Spotify Premium (1 Mo)', cost: 1500, type: 'giftcard', icon: FiGift, color: 'text-green-500' },
        { id: 'sub_gemini_5000', name: 'Gemini Advanced (1 Mo)', cost: 5000, type: 'giftcard', icon: FiStar, color: 'text-purple-500' },
        { id: 'sub_chatgpt_5000', name: 'ChatGPT Plus (1 Mo)', cost: 5000, type: 'giftcard', icon: FiZap, color: 'text-emerald-500' },
        {
            id: 'cash_custom',
            name: `Account Credit Rs. ${exchangeRate ? (10000 * exchangeRate.rate).toLocaleString() : '...'}`,
            cost: 10000,
            type: 'cashback',
            icon: FiCreditCard,
            color: 'text-emerald-400',
            isDynamic: true
        },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Rewards Program</h2>
                <p className="text-slate-500 dark:text-slate-400">Earn points on every transaction and redeem for exclusive perks.</p>
            </div>

            {/* Dashboard Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl shadow-indigo-900/40 text-center"
            >
                <div className="relative z-10 text-white">
                    <div className="absolute top-0 right-0 p-4">
                        {exchangeRate && (
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-left">
                                <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">Live Rate</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold">1 PT = {exchangeRate.currency} {exchangeRate.rate.toFixed(2)}</span>
                                    {/* <span className="text-xs text-emerald-400 flex items-center"><FiTrendingUp/ > +2%</span> */}
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-indigo-200 font-medium tracking-widest uppercase text-sm mb-2">{balance.program} MEMBER</p>
                    <div className="flex items-center justify-center gap-1">
                        <h1 className="text-7xl font-black tracking-tighter drop-shadow-lg">{balance.points.toLocaleString()}</h1>
                        <span className="text-2xl font-bold opacity-80 mt-8">PTS</span>
                    </div>

                    {exchangeRate && (
                        <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10">
                            <span className="text-sm font-medium text-indigo-100">Total Value:</span>
                            <span className="text-lg font-bold text-white">Rs. {(balance.points * exchangeRate.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}

                    <p className="text-indigo-100 mt-6 max-w-md mx-auto text-sm opacity-80">
                        You are in the top 5% of earners this month! Keep using your card to reach Platinum status.
                    </p>
                </div>

                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-[-50%] right-[-20%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-3xl"></div>
                    <FiStar className="absolute top-10 right-10 text-white/10 w-32 h-32 rotate-12" />
                    <FiGift className="absolute bottom-10 left-10 text-white/5 w-24 h-24 -rotate-12" />
                </div>
            </motion.div>

            {/* My Rewards Basket */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiShoppingBag className="text-indigo-500" /> My Rewards Basket
                </h3>

                {myRewards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {myRewards.map((reward) => {
                            const expiryDate = new Date(reward.expiry_date);
                            const isExpired = new Date() > expiryDate;
                            const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

                            return (
                                <div key={reward.id} className={`group relative bg-white dark:bg-[#1e293b] border ${isExpired ? 'border-slate-100 dark:border-white/5 opacity-50 grayscale' : 'border-slate-200 dark:border-white/10 hover:border-indigo-500'} p-5 rounded-2xl transition-all shadow-sm overflow-hidden`}>
                                    {isExpired && (
                                        <div className="absolute inset-0 z-10 bg-slate-100/10 backdrop-blur-[1px] flex items-center justify-center">
                                            <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Expired</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-3">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <FiGift size={20} />
                                        </div>
                                        {!isExpired && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${daysLeft <= 2 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {daysLeft} days left
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{reward.item_name}</h4>
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded p-2 text-center my-3 relative group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                        <p className="font-mono text-sm tracking-widest font-bold text-slate-600 dark:text-slate-300">
                                            {isExpired ? 'EXPIRED' : reward.code}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-400 text-center">
                                        Expires on {expiryDate.toLocaleDateString()}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <FiShoppingBag size={24} />
                        </div>
                        <h4 className="text-slate-900 dark:text-white font-medium mb-1">Your basket is empty</h4>
                        <p className="text-slate-500 text-sm">Redeem gift cards to see them here.</p>
                    </div>
                )}
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-white/5 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
                    <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                        <FiCheckCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">How to Earn</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Earn <span className="text-slate-900 dark:text-white font-semibold">1 Point</span> for every <span className="text-slate-900 dark:text-white font-semibold">Rs. 10</span> spent on bill payments.
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-white/5 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
                    <div className="p-3 rounded-full bg-amber-500/10 text-amber-500">
                        <FiStar size={24} />
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">Pro Tip</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Pay your bills before the due date to earn <span className="text-amber-500 dark:text-amber-400 font-semibold">2x Bonus Points</span> (Coming Soon).
                        </p>
                    </div>
                </div>
            </div>

            {/* Redemption Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <FiGift className="text-purple-500" /> Redeem Rewards
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {GIFT_CARDS.map((item) => {
                        const canAfford = balance.points >= item.cost;
                        return (
                            <div key={item.id} className="group relative bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 hover:border-indigo-500 dark:hover:border-white/10 p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900 ${item.color}`}>
                                        <item.icon size={28} />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${canAfford ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                        {item.cost.toLocaleString()} PTS
                                        {item.isDynamic && exchangeRate && <span className="block text-[10px] opacity-70 font-normal">Rate: {exchangeRate.rate}</span>}
                                    </span>
                                </div>

                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{item.name}</h4>
                                <p className="text-slate-500 dark:text-slate-500 text-sm mb-6">Instant delivery to email</p>

                                <button
                                    onClick={() => handleRedeem(item)}
                                    disabled={!canAfford || redeeming}
                                    className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2
                                    ${canAfford
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white shadow-lg shadow-purple-900/10'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    {redeeming === item.id ? (
                                        <><FiLoader className="animate-spin" /> Redeeming...</>
                                    ) : (
                                        canAfford ? 'Redeem Now' : 'Insufficent Points'
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                            <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 text-emerald-500 animate-bounce">
                                <FiCheckCircle size={40} />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Redemption Successful!</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                You have successfully redeemed <strong>{successData?.name}</strong>.
                                A confirmation email has been sent to you.
                            </p>

                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-8">
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">New Balance</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">{successData?.balance?.toLocaleString()} PTS</p>
                            </div>

                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg hover:scale-[1.02] transition-transform"
                            >
                                Awesome!
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}