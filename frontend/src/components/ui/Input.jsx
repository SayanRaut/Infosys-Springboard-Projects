import React from 'react';

export default function Input({ label, error, icon: Icon, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          {...props}
          className={`w-full bg-[#0f172a] border ${error ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-700 focus:border-blue-500'} 
            rounded-xl py-2.5 text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all
            ${Icon ? 'pl-10' : 'pl-4'} pr-4`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}