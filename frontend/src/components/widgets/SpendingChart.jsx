import React from 'react';
import Card from '../ui/Card';

export default function SpendingChart({ data = [] }) {
  // Expects data: [{ day: 'Mon', amount: 120 }, ...]
  const maxVal = Math.max(...data.map(d => d.amount), 100);

  return (
    <Card className="flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-200">Weekly Spending</h3>
        <select className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1 outline-none">
          <option>This Week</option>
          <option>Last Week</option>
        </select>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 px-2">
        {data.map((item, index) => {
          const heightPercent = (item.amount / maxVal) * 100;
          return (
            <div key={index} className="flex flex-col items-center gap-2 group w-full">
              <div className="relative w-full bg-slate-800/50 rounded-t-lg h-48 flex items-end overflow-hidden">
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                  Rs. {item.amount}
                </div>

                {/* Bar */}
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 opacity-80 group-hover:opacity-100 transition-all duration-500 rounded-t-md mx-auto"
                  style={{ height: `${heightPercent}%`, width: '60%' }}
                ></div>
              </div>
              <span className="text-xs text-slate-500 font-medium">{item.day}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}