// src/pages/Payments.jsx
import React, { useState } from "react";
import { Send } from "lucide-react";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { DEMO_ACCOUNTS, DEMO_RECIPIENTS } from "../data/demoData";

const Payments = () => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Pretending to send $${amount || 0} to ${recipient || "someone"} 💸`
    );
    setAmount("");
    setRecipient("");
    setNote("");
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Send money form */}
      <Card className="p-4 sm:p-5 lg:col-span-2">
        <SectionHeader
          title="Send Money"
          subtitle="Transfer funds to saved recipients or new accounts"
        />
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                From account
              </label>
              <select className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/60">
                {DEMO_ACCOUNTS.map((acc) => (
                  <option key={acc.id}>
                    {acc.name} ({acc.number})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Recipient
              </label>
              <input
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                placeholder="Name or IBAN / account number"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Amount
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden">
                <span className="px-3 text-xs text-slate-500 bg-slate-50 border-r border-slate-200">
                  USD
                </span>
                <input
                  className="w-full px-3 py-2 text-sm focus:outline-none"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date
              </label>
              <input
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                type="date"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Transfer type
              </label>
              <select className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/60">
                <option>Instant</option>
                <option>Standard (1–2 days)</option>
                <option>Scheduled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Note (optional)
            </label>
            <textarea
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
              rows={3}
              placeholder="Add a note for this transfer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl"
          >
            <Send className="w-4 h-4" />
            Send transfer
          </button>
        </form>
      </Card>

      {/* Recent recipients */}
      <Card className="p-4 sm:p-5">
        <SectionHeader
          title="Recent Recipients"
          subtitle="People you often send money to"
          right={
            <button className="text-xs text-slate-500 hover:text-slate-700">
              Manage
            </button>
          }
        />
        <div className="space-y-3 text-sm">
          {DEMO_RECIPIENTS.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-semibold">
                  {r.initials}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-900">
                    {r.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{r.bank}</p>
                </div>
              </div>
              <button className="text-xs text-sky-600 hover:text-sky-700">
                Send
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Payments;
