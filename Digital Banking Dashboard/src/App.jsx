// src/App.jsx
import React, { useState } from "react";
import {
  LayoutDashboard,
  CreditCard,
  Send,
  BarChart3,
  Settings as SettingsIcon,
  Wallet,
  Bell,
  Search,
} from "lucide-react";

import { useMousePosition } from "./hooks/useMousePosition";
import { DEMO_USER } from "./data/demoData";

import Overview from "./pages/Overview";
import Accounts from "./pages/Accounts";
import Cards from "./pages/Cards";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import AuthPage from "./pages/AuthPage"; // 👈 your auth page

const navItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "payments", label: "Payments", icon: Send },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

/* ---------------- Dashboard Shell ---------------- */

const DashboardApp = ({ user, onSignOut }) => {
  const [active, setActive] = useState("overview"); // 👈 default is overview
  const { x, y } = useMousePosition();

  const vw = typeof window !== "undefined" ? window.innerWidth : 1;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1;
  const parallaxX = ((x || 0) / vw - 0.5) * 40;
  const parallaxY = ((y || 0) / vh - 0.5) * 40;

  const renderPage = () => {
    switch (active) {
      case "overview":
        return <Overview onSignOut={onSignOut} />; // 👈 passes sign out
      case "accounts":
        return <Accounts />;
      case "cards":
        return <Cards />;
      case "payments":
        return <Payments />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return <Overview onSignOut={onSignOut} />;
    }
  };

  const displayName = user?.name || DEMO_USER.name;
  const email = user?.email || DEMO_USER.email;
  const tier = DEMO_USER.tier || "Premium";

  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-100">
      {/* Floating gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-violet-50" />
        <div
          className="absolute -top-40 -left-32 w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-sky-400/40 via-indigo-400/30 to-cyan-300/40 blur-3xl transition-transform duration-150 ease-out"
          style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)` }}
        />
        <div
          className="absolute -bottom-52 -right-40 w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-fuchsia-400/35 via-violet-400/30 to-amber-300/40 blur-3xl transition-transform duration-150 ease-out"
          style={{ transform: `translate(${-parallaxX}px, ${-parallaxY}px)` }}
        />
        <div
          className="absolute w-32 h-32 rounded-full blur-3xl opacity-70 transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${(x || 0) - 64}px, ${(y || 0) - 64}px)`,
            background:
              "radial-gradient(circle at center, rgba(56,189,248,0.6), rgba(129,140,248,0.15))",
          }}
        />
      </div>

      {/* Shell */}
      <div className="relative z-10 max-w-7xl mx-auto min-h-screen flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 py-6 px-4 gap-6 bg-white/80 border-r border-slate-200 backdrop-blur-xl mt-4 mb-4 rounded-3xl shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
          {/* logo */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Team3 Bank
              </p>
              <p className="text-[11px] text-slate-500">Digital Banking Suite</p>
            </div>
          </div>

          {/* nav */}
          <nav className="flex-1 mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === active;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                    ${
                      isActive
                        ? "bg-slate-900 text-sky-100 shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* user + footer */}
          <div className="pt-3 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{displayName}</p>
                <p className="text-[11px] text-slate-500">{tier} member</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 px-1">
              Secure sessions • End-to-end encrypted
            </p>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col mt-4 mb-4 md:ml-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.12)] overflow-hidden">
          {/* top bar */}
          <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 bg-white/70">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-900">
                Team3 Bank
              </span>
            </div>

            {/* Search */}
            <div className="hidden sm:block flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  placeholder="Search in accounts, cards, transactions..."
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <button className="relative p-1.5 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-700">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold">
                  {initials}
                </div>
                <div className="leading-tight">
                  <p className="font-semibold text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500">{email}</p>
                </div>
              </div>
            </div>
          </header>

          {/* page content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Root App: auth → dashboard ---------------- */

const App = () => {
  const [user, setUser] = useState(null);

  const handleSignOut = () => {
    setUser(null); // back to AuthPage
  };

  if (!user) {
    // 👇 this connects directly with your AuthPage's onAuthSuccess
    return <AuthPage onAuthSuccess={setUser} />;
  }

  return <DashboardApp user={user} onSignOut={handleSignOut} />;
};

export default App;
