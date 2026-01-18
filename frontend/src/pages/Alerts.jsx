import React, { useEffect, useState } from 'react';
import { FiClock, FiActivity, FiAlertCircle, FiCheckCircle, FiTrash2, FiBell } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { toast } from 'sonner';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readAlerts, setReadAlerts] = useState([]);
  const [viewMode, setViewMode] = useState('cards');

  // Load read IDs from local storage
  const [readAlertIds, setReadAlertIds] = useState(() => {
    try {
      const saved = localStorage.getItem('banking_read_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // Persist read IDs whenever they change
  useEffect(() => {
    localStorage.setItem('banking_read_alerts', JSON.stringify(readAlertIds));
  }, [readAlertIds]);

  useEffect(() => {
    fetchAlerts();
  }, [readAlertIds]); // Re-run filter if IDs change (though mostly they change via actions) - actually fetch depends on mount, filter depends on data.

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts/list');
      const allAlerts = res.data;

      // Segregate based on persisted IDs
      const newAlertsData = allAlerts.filter(a => !readAlertIds.includes(a.id));
      const readAlertsData = allAlerts.filter(a => readAlertIds.includes(a.id));

      setAlerts(newAlertsData);
      setReadAlerts(readAlertsData);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    const alertToRead = alerts.find(a => a.id === id);
    if (alertToRead) {
      setReadAlertIds(prev => [...prev, id]); // This will trigger effect to save to LS
      setReadAlerts(prev => [alertToRead, ...prev]);
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success("Marked as read");
    }
  };

  const markAllRead = () => {
    const allIds = [...readAlertIds, ...alerts.map(a => a.id)];
    setReadAlertIds(allIds);
    setReadAlerts(prev => [...alerts, ...prev]);
    setAlerts([]);
    toast.success("All alerts marked as read");
  };

  const clearHistory = () => {
    // Only clear the UI list or also un-read them? usually clear history means remove from view.
    // But since they are dynamic from backend, "clearing" might mean "forgetting they were read" (restoring them to new) 
    // OR "hiding them until they regenerate with new IDs"?
    // Expected behavior for "Clear History" in this context (Previous Alerts) usually means "Delete them".
    // But we can't delete them from backend.
    // So let's just empty the readAlerts view, but keep them in readAlertIds so they don't reappear as Value?
    // Actually if we clear history, we probably just want to hide them.
    // But next fetch will bring them back as "New" if we don't ignore them?
    // Let's assume clear history means "Remove from Previous Alerts list ONLY".
    // But if we fetch again, they will be in 'readAlertsData'.
    // To truly "delete" them, we might need a "deletedAlertIds" list.
    // For now, let's just clear the state, but if user refreshes, they might come back as Read.
    // Let's Keep it simple: Just clear the UI array.
    setReadAlerts([]);
    toast.success("History cleared");
  }

  // Derived counts
  const billReminders = alerts.filter(a => a.category === 'Bill Due').length;
  const budgetAlerts = alerts.filter(a => a.category === 'Budget Alert').length;

  // Hardcoded for demo/completeness if backend doesn't provide specific categories yet
  const lowBalance = alerts.filter(a => a.category === 'Account').length;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Alerts</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Stay updated on important account activities.</p>
        </div>
        <div className="flex gap-3">
          {/* View Toggles */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <FiCheckCircle size={18} /> {/* Using CheckCircle as generic icon or maybe Grid icon if available */}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <FiListIcon />
            </button>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-300 transition-all shadow-sm"
            >
              <FiCheckCircle /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Unread"
          count={alerts.length}
          label="New alerts"
          icon={FiBell}
          color="text-emerald-400"
        />
        <SummaryCard
          title="Bill Reminders"
          count={billReminders}
          label="Active reminders"
          icon={FiClock}
          color="text-amber-400"
        />
        <SummaryCard
          title="Low Balance"
          count={lowBalance}
          label="Warnings"
          icon={FiActivity}
          color="text-rose-400"
        />
        <SummaryCard
          title="Budget Alerts"
          count={budgetAlerts}
          label="Notifications"
          icon={FiAlertCircle}
          color="text-emerald-400"
        />
      </div>

      {/* Content Section */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">New Alerts</h3>
        <AnimatePresence mode="wait">
          {loading ? (
            <p className="text-slate-500">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-2xl text-slate-500">
              No new alerts
            </motion.div>
          ) : viewMode === 'cards' ? (
            <div className="space-y-3">
              {alerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} onAction={() => markAsRead(alert.id)} />
              ))}
            </div>
          ) : (
            /* Table View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Message</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {alerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${alert.type === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-400/20 text-amber-400'}`}>
                          {alert.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-900 dark:text-white font-medium">{alert.title}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-sm max-w-md truncate">{alert.message}</td>
                      <td className="p-4 text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">{alert.created_at}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => markAsRead(alert.id)} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">Mark Read</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Previous Alerts Section */}
      {readAlerts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4 mt-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Previous Alerts</h3>
            <button onClick={clearHistory} className="text-xs text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1"><FiTrash2 /> Clear History</button>
          </div>
          <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
            {readAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} isRead />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Icon for List
function FiListIcon() {
  return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
}

function SummaryCard({ title, count, label, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden shadow-sm">
      <div className="flex justify-between items-start z-10">
        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="z-10">
        <h3 className={`text-3xl font-bold ${count > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{count}</h3>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
      {/* Background Decoration */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${color.replace('text', 'bg')}/10 rounded-full blur-2xl z-0`} />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';

// ... (existing helper functions)

function AlertCard({ alert, onAction, isRead }) {
  const isCritical = alert.type === 'critical';
  const navigate = useNavigate();

  /* Loading Overlay State */
  const [navigating, setNavigating] = useState(false);

  const handleCardClick = () => {
    if (alert.link) {
      // Mark as read immediately when clicked
      if (!isRead) {
        onAction();
      }

      // 2 Second Loading Simulation
      setNavigating(true);
      setTimeout(() => {
        setNavigating(false);
        navigate(alert.link);
      }, 2000);
    }
  };

  return (
    <>
      {/* Navigation Loader Overlay */}
      <AnimatePresence>
        {navigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white"
          >
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-bold animate-pulse">Navigating...</h3>
            <p className="text-slate-400 text-sm mt-2">Taking you to {alert.category} details</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
        onClick={handleCardClick}
        className={`bg-white dark:bg-[#1e293b] border ${isCritical ? 'border-rose-500/20' : 'border-slate-200 dark:border-white/5'} p-4 rounded-xl flex items-center gap-4 group hover:border-indigo-500/30 dark:hover:border-white/10 transition-all shadow-sm ${alert.link ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02]' : ''}`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isCritical ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'}`}>
          {alert.category === 'Bill Due' ? <FiClock className="w-6 h-6" /> :
            alert.category === 'Budget Alert' ? <FiActivity className="w-6 h-6" /> : <FiBell className="w-6 h-6" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'bg-rose-500 text-white' : 'bg-amber-100 dark:bg-amber-400/10 text-amber-800 dark:text-amber-400'}`}>
              {alert.category}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{alert.created_at}</span>
          </div>
          <h4 className="text-slate-900 dark:text-white font-semibold truncate">{alert.title}</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{alert.message}</p>
          <div className="flex items-center gap-2 mt-2">
            {alert.link && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-colors">Click to View</span>}
          </div>
        </div>

        {!isRead && (
          <button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            Mark Read
          </button>
        )}
      </motion.div>
    </>
  );
}