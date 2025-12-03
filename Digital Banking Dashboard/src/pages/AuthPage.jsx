// src/pages/AuthPage.jsx
import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Shield,
  Smartphone,
  Smile,
} from "lucide-react";
import { useMousePosition } from "../hooks/useMousePosition";

/* ---------- Lady illustration (pure SVG, floating) ---------- */

const LadyIllustration = ({ offsetX = 0, offsetY = 0 }) => (
  <div
    className="transition-transform duration-150 ease-out auth-float"
    style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
    aria-hidden="true"
  >
    <svg
      width="260"
      height="260"
      viewBox="0 0 260 260"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_18px_40px_rgba(15,23,42,0.5)]"
    >
      {/* background circle */}
      <defs>
        <linearGradient id="ladyBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="shirt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>

      <circle cx="130" cy="130" r="110" fill="url(#ladyBg)" opacity="0.9" />

      {/* shoulders / torso */}
      <path
        d="M60 190C75 160 100 145 130 145C160 145 185 160 200 190C200 205 190 215 172 220C150 225 130 227 110 225C90 223 75 217 65 210C60 205 60 197 60 190Z"
        fill="url(#shirt)"
      />

      {/* neck */}
      <rect x="115" y="120" width="30" height="26" rx="10" fill="#fed7aa" />

      {/* face */}
      <circle cx="130" cy="100" r="38" fill="#ffddb8" />

      {/* hair */}
      <path
        d="M90 105C90 75 108 55 130 55C152 55 170 75 170 105C170 140 155 155 140 162C142 150 140 140 135 136C132 133 125 132 118 134C110 137 105 143 102 152C94 145 90 130 90 105Z"
        fill="url(#hair)"
      />

      {/* fringe */}
      <path
        d="M96 90C99 72 112 63 130 63C148 63 161 72 164 90C150 88 141 92 134 98C129 94 120 90 110 90C104 90 100 90 96 90Z"
        fill="#fb7185"
      />

      {/* eyes */}
      <circle cx="118" cy="102" r="4" fill="#334155" />
      <circle cx="142" cy="102" r="4" fill="#334155" />

      {/* eyebrows */}
      <path
        d="M110 93C115 91 118 91 122 92"
        stroke="#9f1239"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M138 92C142 91 146 92 150 93"
        stroke="#9f1239"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* nose */}
      <path
        d="M130 104C131 108 131 110 129 112"
        stroke="#fb7185"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* smile */}
      <path
        d="M118 115C123 122 137 122 142 115"
        stroke="#e11d48"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* small blush */}
      <circle cx="112" cy="110" r="3" fill="#fecaca" />
      <circle cx="148" cy="110" r="3" fill="#fecaca" />

      {/* laptop */}
      <rect
        x="80"
        y="165"
        width="100"
        height="50"
        rx="10"
        fill="#020617"
        stroke="#38bdf8"
        strokeWidth="2"
      />
      <rect x="90" y="172" width="80" height="28" rx="6" fill="#020617" />
      <circle cx="130" cy="187" r="4" fill="#38bdf8" />

      {/* hands */}
      <circle cx="100" cy="165" r="8" fill="#ffddb8" />
      <circle cx="160" cy="165" r="8" fill="#ffddb8" />
    </svg>
  </div>
);

/* ---------- Tips / emotes that change below the lady ---------- */

const TIPS = [
  "Track all your accounts in one secure place.",
  "Instant transfers with real-time notifications.",
  "Smart insights to understand your spending.",
  "Cards, savings, and payments on a single screen.",
];

const AuthPage = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [tipIndex, setTipIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // form data
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    remember: true,
    acceptTerms: false,
  });

  const { x = 0, y = 0 } = useMousePosition();
  const vw = typeof window !== "undefined" ? window.innerWidth : 1;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1;

  const parallaxX = (x / vw - 0.5) * 40;
  const parallaxY = (y / vh - 0.5) * 40;
  const ladyOffsetX = (x / vw - 0.5) * 15;
  const ladyOffsetY = (y / vh - 0.5) * 10;

  // rotate tips
  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !form.acceptTerms) {
      setError("Please accept the terms & privacy policy to continue.");
      return;
    }
    if (!form.email || !form.password || (mode === "signup" && !form.name)) {
      setError("Please fill in all required fields.");
      return;
    }

    // mock auth
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onAuthSuccess) {
        onAuthSuccess({ email: form.email, name: form.name || "Team3 User" });
      } else {
        console.log("Authenticated as:", form);
        alert(`Welcome to Team3 Bank, ${form.name || "there"}!`);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-950 text-slate-50">
      {/* floating gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* colorful blobs throwing into void */}
        <div
          className="absolute -top-40 -left-40 w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-sky-500/40 via-indigo-500/40 to-purple-500/40 blur-3xl transition-transform duration-150 ease-out"
          style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)` }}
        />
        <div
          className="absolute -bottom-52 -right-40 w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-emerald-400/35 via-cyan-400/35 to-amber-300/40 blur-3xl transition-transform duration-150 ease-out"
          style={{ transform: `translate(${-parallaxX}px, ${-parallaxY}px)` }}
        />
        <div
          className="absolute inset-x-20 top-10 bottom-10 bg-gradient-to-b from-white/10 via-transparent to-transparent rounded-[3rem] blur-3xl opacity-60"
        />

        {/* cursor glow */}
        <div
          className="absolute w-32 h-32 rounded-full blur-3xl opacity-70 transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${x - 64}px, ${y - 64}px)`,
            background:
              "radial-gradient(circle at center, rgba(56,189,248,0.6), rgba(129,140,248,0.15))",
          }}
        />
      </div>

      {/* auth shell */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-5xl bg-white/10 border border-white/15 backdrop-blur-2xl rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.9)] overflow-hidden">
          <div className="grid md:grid-cols-[1.1fr_1fr]">
            {/* left panel: lady + tips */}
            <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-purple-500/20 px-8 py-7 border-r border-white/10">
              {/* logo small top-left */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                  <span className="text-xs font-bold">T3</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Team3 Bank
                  </p>
                  <p className="text-[11px] text-slate-100/80">
                    Modern Digital Banking
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center">
                <LadyIllustration offsetX={ladyOffsetX} offsetY={ladyOffsetY} />

                {/* speech bubble / changing emotes */}
                <div className="mt-6 max-w-xs text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/30 text-[11px] text-slate-100 mb-3">
                    <Smile className="w-3 h-3" />
                    <span>Hey! I’ll guide your money.</span>
                  </div>
                  <p className="text-sm font-medium text-slate-50 tip-fade">
                    {TIPS[tipIndex]}
                  </p>
                </div>
              </div>

              {/* bottom security badges */}
              <div className="mt-6 flex items-center justify-between text-[11px] text-slate-100/80">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  <span>256-bit encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Face ID & OTP ready</span>
                </div>
              </div>
            </div>

            {/* right: auth form */}
            <div className="bg-slate-950/70 px-6 sm:px-8 py-7">
              {/* small logo for mobile */}
              <div className="flex items-center justify-between mb-6 md:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                    <span className="text-xs font-bold">T3</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Team3 Bank
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Digital Banking
                    </p>
                  </div>
                </div>
              </div>

              {/* headings */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white">
                  {mode === "login"
                    ? "Welcome back to Team3 Bank"
                    : "Create your Team3 account"}
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  {mode === "login"
                    ? "Sign in to access your dashboard, cards and transfers."
                    : "Sign up to manage your money smarter, in one place."}
                </p>
              </div>

              {/* error notice */}
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* social auth buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 hover:border-sky-500/70 hover:text-sky-100 transition-colors"
                  aria-label="Continue with Google"
                >
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-800">
                    G
                  </span>
                  <span>
                    {mode === "login"
                      ? "Continue with Google"
                      : "Sign up with Google"}
                  </span>
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 hover:border-sky-500/70 hover:text-sky-100 transition-colors"
                  aria-label="Continue with GitHub"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-100">
                    GH
                  </span>
                  <span>
                    {mode === "login"
                      ? "Continue with GitHub"
                      : "Sign up with GitHub"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5 text-[11px] text-slate-500">
                <div className="h-px flex-1 bg-slate-700/70" />
                <span>or use email</span>
                <div className="h-px flex-1 bg-slate-700/70" />
              </div>

              {/* form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-3 text-sm"
                noValidate
              >
                {mode === "signup" && (
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-medium text-slate-200 mb-1"
                    >
                      Full name
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                        placeholder="Alex Johnson"
                        value={form.name}
                        onChange={handleChange("name")}
                        required={mode === "signup"}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-slate-200 mb-1"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                      placeholder="you@team3bank.com"
                      value={form.email}
                      onChange={handleChange("email")}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-slate-200 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-9 pr-9 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange("password")}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* remember / forgot */}
                {mode === "login" && (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <label className="inline-flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.remember}
                        onChange={handleChange("remember")}
                        className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500/70"
                      />
                      <span>Remember this device</span>
                    </label>
                    <button
                      type="button"
                      className="text-[11px] text-sky-400 hover:text-sky-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* terms for signup */}
                {mode === "signup" && (
                  <div className="pt-1">
                    <label className="inline-flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.acceptTerms}
                        onChange={handleChange("acceptTerms")}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500/70"
                      />
                      <span>
                        I agree to the{" "}
                        <button
                          type="button"
                          className="underline underline-offset-2 text-sky-300 hover:text-sky-200"
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="underline underline-offset-2 text-sky-300 hover:text-sky-200"
                        >
                          Privacy Policy
                        </button>
                        .
                      </span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold text-white py-2.5 transition-colors"
                >
                  {isSubmitting ? (
                    <span className="text-xs">Processing…</span>
                  ) : (
                    <>
                      <span>
                        {mode === "login"
                          ? "Sign in to Team3 Bank"
                          : "Create Team3 account"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* switch mode */}
              <div className="mt-5 text-[11px] text-slate-300 text-center">
                {mode === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setError("");
                      }}
                      className="font-semibold text-sky-300 hover:text-sky-200"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already banking with us?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setError("");
                      }}
                      className="font-semibold text-sky-300 hover:text-sky-200"
                    >
                      Log in
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* local styles for float + tip fade */}
      <style>{`
        @keyframes auth-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .auth-float {
          animation: auth-float 6s ease-in-out infinite;
        }
        @keyframes tip-fade {
          0% { opacity: 0; transform: translateY(4px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        .tip-fade {
          animation: tip-fade 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
