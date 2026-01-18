import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] border border-slate-700 p-3 rounded-xl shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-bold text-lg">
          Rs. {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// 1. Smooth Spline Area Chart (The "Green Wave" from screenshot)
export const BalanceCurveChart = ({ data }) => {
  return (
    <div className="h-[350px] w-full bg-[#1e293b]/60 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-lg flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h3 className="text-xl font-bold text-slate-100">Balance Statistics</h3>
          <p className="text-slate-400 text-sm">+12% vs last month</p>
        </div>
        <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm text-slate-300 outline-none">
          <option>Yearly</option>
          <option>Monthly</option>
        </select>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.4} />
            <XAxis dataKey="date" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
            <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(val) => `Rs. ${val / 1000}k`} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone" // This makes it smooth/curved
              dataKey="balance"
              stroke="#10b981"
              strokeWidth={4}
              fill="url(#colorIncome)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 2. Bar Chart for Income vs Expenses (Bottom left of screenshot)
export const IncomeBarChart = ({ data }) => {
  return (
    <div className="h-[300px] w-full bg-[#1e293b]/60 border border-white/5 rounded-3xl p-6 backdrop-blur-sm shadow-lg flex flex-col">
      <h3 className="text-lg font-bold text-slate-100 mb-6 shrink-0">Income vs Savings</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
            <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
            <Tooltip cursor={{ fill: '#ffffff10' }} content={<CustomTooltip />} />
            <Bar dataKey="income" fill="#10b981" radius={[10, 10, 0, 0]} />
            <Bar dataKey="expense" fill="#f59e0b" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}