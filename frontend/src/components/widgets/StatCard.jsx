import React from 'react';
import Card from '../ui/Card';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

export default function StatCard({ title, amount, trend, trendValue, icon: Icon, colorClass = "text-blue-500" }) {
  const isPositive = trend === 'up';
  
  return (
    <Card className="relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={80} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl bg-slate-800/80 border border-white/5 ${colorClass}`}>
            <Icon size={24} />
          </div>
          <p className="text-slate-400 font-medium">{title}</p>
        </div>
        
        <h3 className="text-3xl font-bold text-slate-100 tracking-tight">{amount}</h3>
        
        {trendValue && (
          <div className="flex items-center gap-2 mt-2">
            <span className={`flex items-center text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <FiArrowUpRight /> : <FiArrowDownRight />} {trendValue}
            </span>
            <span className="text-xs text-slate-500">vs last month</span>
          </div>
        )}
      </div>
    </Card>
  );
}