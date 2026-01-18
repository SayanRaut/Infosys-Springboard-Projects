import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Plus, RefreshCw, Wallet, PiggyBank, CreditCard, ArrowUpRight, X, Building2, Trash2, CheckCircle, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { toast } from 'sonner';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({ net_worth: 0, assets: 0, liabilities: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Delete Modal State
  const [accountToDelete, setAccountToDelete] = useState(null);

  const fetchData = async () => {
    try {
      const [accountsRes, summaryRes] = await Promise.all([
        api.get('/accounts/'),
        api.get('/accounts/summary')
      ]);
      setAccounts(accountsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      toast.error("Failed to load accounts.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      await api.delete(`/accounts/${accountToDelete.id}`);
      toast.success("Account deleted successfully");
      setAccounts(prev => prev.filter(a => a.id !== accountToDelete.id));
      fetchData(); // Refetch to get clean summary
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account");
    } finally {
      setAccountToDelete(null);
    }
  };

  // Mock History for now since we don't have a history endpoint, 
  // but in a real app we'd fetch actual history.
  // Using a flat line based on current net worth for "real feel" if empty.
  const chartData = [
    { month: 'Start', value: summary.net_worth * 0.9 },
    { month: 'Now', value: summary.net_worth }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-2">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Accounts</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage all your linked bank accounts and cards.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-5 py-2 rounded-lg transition-all font-semibold shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-5 h-5" /> Link Account
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Net Worth"
          amount={summary.net_worth}
          subtitle="Across all accounts"
          icon={<Wallet className="w-5 h-5" />}
        />
        <SummaryCard
          title="Total Assets"
          amount={summary.assets}
          subtitle="Cash & Investments"
          positive
        />
        <SummaryCard
          title="Total Liabilities"
          amount={summary.liabilities}
          subtitle="Credit cards & loans"
          negative
        />
      </div>

      {/* Charts Section */}
      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 transition-colors">Net Worth Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) => `Rs. ${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', color: 'var(--tooltip-text)' }}
                itemStyle={{ color: '#10b981' }}
                formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Net Worth']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accounts Grid */}
      <div>
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-4 transition-colors">Your Accounts</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800/50 rounded-2xl"></div>)}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed transition-colors duration-300">
            <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 transition-colors">
              <Wallet className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">No accounts linked</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 transition-colors">Link your store, current, savings, or credit card accounts to see them here.</p>
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Link First Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {accounts.map((account) => (
              <AccountCard key={account.id} data={account} onDelete={() => handleDeleteClick(account)} />
            ))}
          </div>
        )}
      </div>

      {/* Link Account Modal */}
      <LinkAccountModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSuccess={() => {
          fetchData();
          setIsLinkModalOpen(false);
          toast.success("Account linked successfully!");
        }}
      />

      {/* Delete Confirmation Modal (Slide to Delete) */}
      <DeleteConfirmationModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={confirmDelete}
        accountName={`${accountToDelete?.bank_name} (${accountToDelete?.masked_account})`}
      />

    </div>
  );
}

function SummaryCard({ title, amount, subtitle, icon, positive, negative }) {
  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-32 relative overflow-hidden shadow-sm transition-colors duration-300">
      <div className="flex justify-between items-start z-10">
        <span className="text-slate-500 dark:text-slate-400 font-medium transition-colors">{title}</span>
        {icon && <div className="text-slate-400 dark:text-slate-400 transition-colors">{icon}</div>}
        {positive !== undefined && (
          <ArrowUpRight className="w-5 h-5 text-emerald-500" />
        )}
        {negative !== undefined && (
          <ArrowUpRight className="w-5 h-5 text-rose-500 rotate-90" />
        )}
      </div>
      <div className="z-10">
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">
          Rs. {amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500 transition-colors">{subtitle}</p>
      </div>
    </div>
  );
}

function AccountCard({ data, onDelete }) {
  // Enhanced Card UI with "Shaded" look
  const isCredit = data.account_type === 'credit_card' || data.account_type === 'loan';

  // Gradients for shading
  const bgClass = isCredit
    ? 'bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95]' // Deep Violet/Indigo
    : data.bank_name.toLowerCase().includes('america')
      ? 'bg-gradient-to-br from-[#881337] to-[#e11d48]' // Deep Rose
      : 'bg-gradient-to-br from-[#064e3b] to-[#10b981]'; // Deep Emerald

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative w-full aspect-[1.586/1] rounded-2xl p-6 shadow-2xl overflow-hidden group ${bgClass}`}
    >
      {/* Shaded Image / Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/20 rounded-full blur-3xl"></div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col justify-between h-full text-white">

        {/* Top Row: Chip & Delete */}
        <div className="flex justify-between items-start">
          <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-inner border border-yellow-600/50 flex items-center justify-center overflow-hidden">
            <div className="w-full h-[1px] bg-yellow-600/50 my-[2px]"></div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
            className="p-1.5 rounded-full bg-black/20 hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-md"
            title="Delete Card"
          >
            <Trash2 size={14} className="text-white" />
          </button>
        </div>

        {/* Middle: Number */}
        <div className="font-mono text-lg tracking-widest opacity-90 shadow-black drop-shadow-md">
          **** **** **** {data.masked_account.slice(-4) || '0000'}
        </div>

        {/* Bottom Row: Details & Logo */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Card Holder</p>
            <p className="font-bold text-sm tracking-wide uppercase truncate max-w-[120px]">{data.bank_name}</p>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-xs opacity-70 mb-0.5">{data.account_type.replace('_', ' ')}</p>
            <p className="font-bold text-lg">
              Rs. {Math.abs(data.balance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LinkAccountModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bank_name: 'Chase Bank',
    account_type: 'checking',
    masked_account: '',
    balance: '',
    pin: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.pin.length !== 4) {
        toast.error("PIN must be 4 digits");
        setIsSubmitting(false);
        return;
      }
      await api.post('/accounts/', {
        ...formData,
        masked_account: '****' + formData.masked_account.slice(-4),
        balance: parseFloat(formData.balance)
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to link account");
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
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 transition-colors duration-300"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                <Building2 className="w-5 h-5 text-emerald-500" /> Link Account
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 transition-colors">Bank Name</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  value={formData.bank_name}
                  onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                >
                  <option value="Chase Bank">Chase Bank</option>
                  <option value="Bank of America">Bank of America</option>
                  <option value="Wells Fargo">Wells Fargo</option>
                  <option value="Citi">Citi</option>
                  <option value="American Express">American Express</option>
                  <option value="Fidelity">Fidelity</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 transition-colors">Account Type</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  value={formData.account_type}
                  onChange={e => setFormData({ ...formData, account_type: e.target.value })}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="investment">Investment</option>
                  <option value="loan">Loan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 transition-colors">Card Last 4 Digits</label>
                  <input
                    type="text" maxLength="4" placeholder="4521"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                    value={formData.masked_account}
                    onChange={e => setFormData({ ...formData, masked_account: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 transition-colors">Current Balance</label>
                  <input
                    type="number" step="0.01" placeholder="1000.00"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                    value={formData.balance}
                    onChange={e => setFormData({ ...formData, balance: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 transition-colors">Set 4-Digit PIN</label>
                  <input
                    type="password" maxLength="4" placeholder="****"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none tracking-widest transition-colors"
                    value={formData.pin || ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) setFormData({ ...formData, pin: val });
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 rounded-lg mt-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Linking...' : 'Link Account'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, accountName }) {
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300"
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
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Delete Account?</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 transition-colors">
                    Do you really want to delete <span className="text-slate-900 dark:text-white font-semibold transition-colors">{accountName}</span>? This action cannot be undone.
                  </p>

                  <div className="relative h-14 bg-slate-800 rounded-full p-1 overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-500 uppercase tracking-widest pointer-events-none">
                      Slide to Delete
                    </div>
                    <SliderButton onConfirm={handleConfirm} disabled={confirmed} />
                  </div>

                  <button
                    onClick={onClose}
                    className="mt-6 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
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
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Success!</h3>
                  <p className="text-emerald-500 dark:text-emerald-400 font-medium transition-colors">
                    Successfully deleted the account
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

function SliderButton({ onConfirm, disabled }) {
  const x = useMotionValue(0);
  const backgroundOpacity = useTransform(x, [0, 250], [0, 1]);
  const [dragEnded, setDragEnded] = useState(false);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 200) { // Threshold to trigger
      setDragEnded(true);
      onConfirm();
    }
  };

  return (
    <div className="relative w-full h-full rounded-full bg-slate-200 dark:bg-slate-800 transition-colors">
      <motion.div
        style={{ opacity: backgroundOpacity }}
        className="absolute inset-0 bg-rose-500 rounded-full"
      />
      <motion.div
        drag={!disabled && !dragEnded ? "x" : false}
        dragConstraints={{ left: 0, right: 260 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className="absolute left-1 top-1 bottom-1 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {disabled || dragEnded ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-rose-500"
          >
            <Trash2 className="w-5 h-5" />
          </motion.div>
        ) : (
          <ChevronRight className="w-6 h-6 text-slate-900" />
        )}
      </motion.div>
    </div>
  );
}
