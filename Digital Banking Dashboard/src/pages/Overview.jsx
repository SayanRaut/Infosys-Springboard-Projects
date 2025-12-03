// src/pages/Overview.jsx
import React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  LogOut,             // 👈 added
} from "lucide-react";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { DEMO_ACCOUNTS, DEMO_TX } from "../data/demoData";

const StatPill = ({ label, value, Icon, positive }) => (
  <div className="flex items-center gap-2 text-xs text-slate-500">
    {Icon && <Icon className="w-3.5 h-3.5" />}
    <span>{label}</span>
    <span
      className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
        positive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700"
      }`}
    >
      {value}
    </span>
  </div>
);

const Overview = ({ onSignOut }) => {          // 👈 now receives onSignOut
  const totalBalance = DEMO_ACCOUNTS.reduce(
    (sum, acc) => sum + acc.balance,
    0
  );
  const thisMonthIncome = 5400;
  const thisMonthExpenses = 2680;

  return (
    <div className="space-y-6">
      {/* Header + sign out */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Overview
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            Welcome back to Team3 Bank
          </h2>
        </div>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        )}
      </div>

      {/* Top stats row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 col-span-2">
          <div className="flex justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-sky-600 uppercase mb-1">
                Total Balance
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                ${totalBalance.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Across {DEMO_ACCOUNTS.length} active accounts
              </p>
              <div className="flex gap-4 mt-3">
                <StatPill
                  label="This month"
                  value="+12.4%"
                  Icon={ArrowUpRight}
                  positive
                />
                <StatPill
                  label="Spending"
                  value="-5.3%"
                  Icon={ArrowDownRight}
                  positive={false}
                />
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end justify-between">
              <button className="inline-flex items-center gap-1.5 text-xs bg-sky-50 text-sky-700 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live banking
              </button>
              <div className="text-right text-xs text-slate-500">
                <p>Last sync: 2 min ago</p>
                <p>All systems operational</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500 uppercase mb-2">
            This Month Snapshot
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Income</span>
              <span className="font-semibold text-emerald-600">
                +${thisMonthIncome.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Expenses</span>
              <span className="font-semibold text-rose-500">
                -${thisMonthExpenses.toLocaleString()}
              </span>
            </div>
          </div>
          {/* Mini bar chart mock */}
          <div className="mt-3 flex items-end gap-1 h-16">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
              const heights = [40, 55, 30, 70, 60, 20, 35];
              return (
                <div key={d} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-2.5 rounded-full bg-sky-400/70"
                    style={{ height: `${heights[i]}%` }}
                  />
                  <span className="text-[10px] text-slate-400 mt-1">{d}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Middle row: accounts + transactions */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Accounts */}
        <Card className="p-4 sm:p-5 lg:col-span-2">
          <SectionHeader
            title="Accounts"
            subtitle="Your active Team3 Bank accounts"
            right={
              <button className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                View all
              </button>
            }
          />
          <div className="grid sm:grid-cols-3 gap-3">
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.id}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-medium">
                    {acc.type}
                  </span>
                  <span className="text-slate-400">{acc.number}</span>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-slate-500">{acc.name}</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {acc.currency} {acc.balance.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent transactions */}
        <Card className="p-4 sm:p-5">
          <SectionHeader
            title="Recent Transactions"
            subtitle="Latest activity"
            right={
              <button className="text-xs text-slate-500 hover:text-slate-700">
                See all
              </button>
            }
          />
          <div className="space-y-3 text-sm">
            {DEMO_TX.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === "income"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-500"
                    }`}
                  >
                    {tx.type === "income" ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-900">
                      {tx.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {tx.category}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p
                    className={`font-semibold ${
                      tx.type === "income"
                        ? "text-emerald-600"
                        : "text-slate-900"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}$
                    {tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
