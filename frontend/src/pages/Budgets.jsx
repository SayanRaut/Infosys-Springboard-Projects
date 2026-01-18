import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Plus, RefreshCw, AlertTriangle, PieChart as PieChartIcon, ArrowUpRight, CheckCircle2, Target, X, Wallet } from 'lucide-react';
import { FiTrash2, FiX, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import api from '../services/api';
import { toast } from 'sonner';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({ total_budget: 0, total_spent: 0, remaining: 0, at_risk: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete State
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Default to current month/year
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchData = async () => {
    try {
      const [budgetsRes, summaryRes] = await Promise.all([
        api.get(`/budgets/`, { params: { month: currentMonth, year: currentYear } }),
        api.get(`/budgets/summary`, { params: { month: currentMonth, year: currentYear } })
      ]);
      setBudgets(budgetsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
      toast.error("Failed to load budgets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Highlight Logic
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  // Scroll to highlight
  useEffect(() => {
    if (highlightId && !isLoading && budgets.length > 0) {
      const element = document.getElementById(`budget-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightId, isLoading, budgets]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Budgets refreshed");
    }, 800);
  };

  const handleDeleteClick = (budget) => {
    setBudgetToDelete(budget);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    try {
      await api.delete(`/budgets/${budgetToDelete.id}`);
      toast.success("Budget deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete budget");
    } finally {
      setBudgetToDelete(null);
      // Modal closes automatically via its own logic or parent state if controlled there, 
      // but here the modal controls its own exit animation timing before calling onConfirm.
      // We set open to false after confirm logic is done if needed, but the modal wait 1.5s then calls this.
      // Actually, we should close the modal state here or let the modal handle it?
      // Looking at the modal implementation: it calls onConfirm(), so we should close the modal state here.
      setDeleteModalOpen(false);
    }
  };

  // Prepare data for Pie Chart
  const pieData = budgets.map(b => ({
    name: b.category,
    value: b.spent_amount
  })).filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-2">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Budgets</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your spending and manage monthly budgets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-emerald-500 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-5 py-2 rounded-lg transition-all font-semibold shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-5 h-5" /> Create Budget
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Budget" value={summary.total_budget} icon={<Target className="w-5 h-5" />} />
        <StatCard title="Total Spent" value={summary.total_spent} icon={<ArrowUpRight className="w-5 h-5 text-emerald-500" />} />
        <StatCard title="Remaining" value={summary.remaining} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} />
        <StatCard
          title="At Risk"
          value={summary.at_risk}
          isCount
          subtitle="Budgets over 80%"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Category Budgets</h3>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"></div>)}
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 shadow-sm">
              <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Wallet className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No budgets set</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">Create a budget to start tracking your expenses for this month.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-6 py-2 rounded-lg font-semibold transition-all"
              >
                Create First Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.map((budget, idx) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  idx={idx}
                  onDelete={handleDeleteClick}
                  isHighlighted={highlightId && String(budget.id) === highlightId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Meaningful Visuals - Pie Chart */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Spending Breakdown</h3>
          <div className="h-[300px] w-full block">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', color: 'var(--tooltip-text)' }}
                    itemStyle={{ color: 'var(--tooltip-text)' }}
                    formatter={(value) => `Rs. ${value}`}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400">
                <PieChartIcon className="w-16 h-16 mx-auto mb-2 opacity-20" />
                <p>No spending data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchData();
          setIsModalOpen(false);
          toast.success("Budget created successfully!");
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        budgetName={budgetToDelete?.category}
      />
    </div>
  );
}

function StatCard({ title, value, icon, isCount = false, subtitle }) {
  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-32 shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">{title}</span>
        {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
      </div>
      <div>
        <h3 className={`text-2xl font-bold ${title === 'At Risk' && value > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'} mb-1`}>
          {isCount ? value : `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </h3>
        {subtitle ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">{title === 'Total Budget' ? 'Monthly limit' : title === 'Remaining' ? 'Left to spend' : '34.4% of budget'}</p>
        )}
      </div>
    </div>
  )
}

function BudgetCard({ budget, idx, onDelete, isHighlighted }) {
  const percent = Math.min((budget.spent_amount / budget.limit_amount) * 100, 100);
  const isDanger = percent > 90;
  const isWarning = percent > 70 && percent <= 90;

  return (
    <motion.div
      id={`budget-${budget.id}`}
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: idx * 0.1 }}
      className={`p-6 rounded-2xl flex flex-col justify-between h-40 group relative border shadow-sm ${isHighlighted ? 'z-10 shadow-lg shadow-amber-900/10 bg-white dark:bg-slate-800' : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-white/5'}`}
    >
      <div className="flex justify-between mb-2">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-200">{budget.category}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rs. {budget.spent_amount.toFixed(2)} of Rs. {budget.limit_amount.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => onDelete(budget)}
          className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>

      <div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
          />
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">{Math.round(percent)}% used</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Rs. {(budget.limit_amount - budget.spent_amount).toFixed(2)} left</span>
        </div>
      </div>
    </motion.div>
  );
}

// ... CreateBudgetModal ...

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, budgetName }) {
  const [confirmed, setConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmed(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      setShowSuccess(true);
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
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
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
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>

                  <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiTrash2 className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Delete Budget?</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8">
                    Do you really want to delete <span className="text-slate-900 dark:text-white font-semibold">{budgetName}</span>? This action cannot be undone.
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
                    Successfully deleted budget
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
    if (info.offset.x > 200) {
      setDragEnded(true);
      onConfirm();
    }
  };

  return (
    <div className="relative w-full h-full rounded-full bg-slate-200 dark:bg-slate-800">
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
            <FiTrash2 className="w-5 h-5" />
          </motion.div>
        ) : (
          <FiChevronRight className="w-6 h-6 text-slate-900" />
        )}
      </motion.div>
    </div>
  );
}

function CreateBudgetModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    category: 'Food & Dining',
    limit_amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/budgets/', {
        ...formData,
        limit_amount: parseFloat(formData.limit_amount)
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create budget");
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
                <Plus className="w-5 h-5 text-emerald-500" /> Create Budget
              </h3>
              <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Housing">Housing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Limit (Rs.)</label>
                <input
                  type="number" step="0.01" placeholder="500.00"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.limit_amount}
                  onChange={e => setFormData({ ...formData, limit_amount: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 rounded-lg mt-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Budget'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
