// src/pages/Analytics.jsx
import React from "react";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";

const Analytics = () => {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Analytics"
        subtitle="Spending & income overview (mock layout)"
        right={
          <button className="text-xs text-slate-500 hover:text-slate-700">
            Export report
          </button>
        }
      />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-600 mb-1">
            Spending by category
          </p>
          <p className="text-[11px] text-slate-500 mb-4">
            Percentage distribution for the last 30 days
          </p>
          <div className="space-y-3 text-xs">
            {[
              { label: "Housing & Bills", value: 32, color: "bg-sky-400" },
              { label: "Food & Dining", value: 22, color: "bg-emerald-400" },
              { label: "Shopping", value: 18, color: "bg-violet-400" },
              { label: "Subscriptions", value: 12, color: "bg-amber-400" },
              { label: "Travel", value: 16, color: "bg-rose-400" },
            ].map((c) => (
              <div key={c.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">{c.label}</span>
                  <span className="font-medium text-slate-900">
                    {c.value}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full ${c.color}`}
                    style={{ width: `${c.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-600 mb-1">
            Monthly cash flow
          </p>
          <p className="text-[11px] text-slate-500 mb-4">
            Income vs expenses for the last 6 months
          </p>
          <div className="mt-2 flex items-end gap-3 h-40">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => {
              const income = [80, 95, 90, 100, 92, 96][i];
              const expense = [50, 60, 55, 65, 60, 62][i];
              return (
                <div key={m} className="flex-1 flex flex-col items-center">
                  <div className="flex items-end gap-1 w-full">
                    <div
                      className="flex-1 rounded-full bg-emerald-400/80"
                      style={{ height: `${income}%` }}
                    />
                    <div
                      className="flex-1 rounded-full bg-rose-400/80"
                      style={{ height: `${expense}%` }}
                    />
                  </div>
                  <span className="mt-1 text-[11px] text-slate-500">
                    {m}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Income
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Expenses
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
