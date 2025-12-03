// src/pages/Accounts.jsx
import React from "react";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { DEMO_ACCOUNTS } from "../data/demoData";

const Accounts = () => {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Accounts"
        subtitle="Manage all your bank accounts in one place"
        right={
          <button className="text-xs bg-sky-600 text-white px-3 py-1.5 rounded-full hover:bg-sky-700">
            + Open New Account
          </button>
        }
      />
      <Card className="p-4 sm:p-5">
        <div className="overflow-x-auto text-sm">
          <table className="w-full border-separate border-spacing-y-2">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="text-left py-1">Account</th>
                <th className="text-left py-1">Type</th>
                <th className="text-right py-1">Balance</th>
                <th className="text-right py-1">Currency</th>
                <th className="text-right py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ACCOUNTS.map((acc) => (
                <tr key={acc.id} className="bg-slate-50/60 rounded-xl">
                  <td className="py-2 px-2 rounded-l-xl">
                    <div>
                      <p className="font-medium text-slate-900">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {acc.number}
                      </p>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-slate-600 text-xs">
                    {acc.type}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold text-slate-900">
                    {acc.balance.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-right text-xs text-slate-500">
                    {acc.currency}
                  </td>
                  <td className="py-2 px-2 rounded-r-xl text-right">
                    <button className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Accounts;
