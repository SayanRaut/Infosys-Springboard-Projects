import React from 'react';

export default function Badge({ children, variant = 'neutral' }) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    neutral: "bg-slate-700/30 text-slate-400 border-slate-700/50",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[variant] || styles.neutral} inline-flex items-center gap-1`}>
      {children}
    </span>
  );
}