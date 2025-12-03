// src/pages/Cards.jsx
import React from "react";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { DEMO_CARDS } from "../data/demoData";

const Cards = () => {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Cards"
        subtitle="Manage your credit & debit cards"
        right={
          <button className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-full hover:bg-slate-800">
            + Issue Virtual Card
          </button>
        }
      />
      <div className="grid md:grid-cols-2 gap-4">
        {DEMO_CARDS.map((card) => {
          const usage = Math.round((card.used / card.limit) * 100);
          return (
            <Card key={card.id} className="p-4 sm:p-5">
              <div
                className={`rounded-2xl bg-gradient-to-tr ${card.gradient} text-white p-4 mb-4 flex flex-col justify-between h-40 relative overflow-hidden`}
              >
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">{card.label}</span>
                  <span className="opacity-70">{card.type} card</span>
                </div>
                <div className="mt-4">
                  <p className="text-xs opacity-80">Card Number</p>
                  <p className="text-lg font-mono tracking-widest">
                    {card.number}
                  </p>
                </div>
                <div className="mt-auto flex justify-between items-end text-xs">
                  <div>
                    <p className="opacity-70">Card Holder</p>
                    <p className="font-semibold">{card.holder}</p>
                  </div>
                  <div className="text-right">
                    <p className="opacity-70">Valid Thru</p>
                    <p className="font-semibold">{card.expiry}</p>
                  </div>
                </div>
                <div className="absolute -right-10 -top-6 w-28 h-28 rounded-full border-4 border-white/30 opacity-40" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-500">Credit limit</p>
                  <p className="font-semibold text-slate-900">
                    ${card.limit.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Used</p>
                  <p className="font-semibold text-slate-900">
                    ${card.used.toLocaleString()} ({usage}%)
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-400"
                  style={{ width: `${usage}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Cards;
