// src/components/AuthForms.jsx
import React, { useState, useRef, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, RefreshCw, Loader2, ChevronRight, Check, X } from "lucide-react";

/* --- Helper: Password Strength Meter --- */
const PasswordStrengthMeter = ({ password, userData }) => {
  if (!password) return null;

  let score = 0;
  let checks = {
    length: password.length >= 6,
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    mixed: /(?=.*[a-zA-Z])(?=.*\d)/.test(password),
    notName: true
  };

  if (userData) {
    const passLower = password.toLowerCase();
    if (userData.name) {
      const parts = userData.name.toLowerCase().split(" ");
      if (parts.some(p => p.length > 2 && passLower.includes(p))) checks.notName = false;
    }
    if (userData.email) {
      const emailPart = userData.email.split("@")[0].toLowerCase();
      if (emailPart.length > 2 && passLower.includes(emailPart)) checks.notName = false;
    }
  }

  if (checks.length) score++;
  if (checks.special) score++;
  if (checks.mixed) score++;
  if (checks.notName) score++;

  let label = "Weak";
  let color = "bg-rose-500";
  let width = "25%";

  if (score >= 3) {
    label = "Medium";
    color = "bg-yellow-500";
    width = "66%";
  }
  if (score === 4) {
    label = "Strong";
    color = "bg-orange-500";
    width = "100%";
  }

  return (
    <div className="mt-2 animate-fade-in">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-slate-400">Password Strength</span>
        <span className={`text-xs font-bold ${score === 4 ? 'text-orange-400' : score >= 3 ? 'text-yellow-500' : 'text-rose-500'}`}>
          {label}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500 ease-out`} style={{ width }}></div>
      </div>

      <div className="grid grid-cols-2 gap-1 mt-2">
        <RuleItem label="6+ Characters" valid={checks.length} />
        <RuleItem label="Special Char (!@#)" valid={checks.special} />
        <RuleItem label="Letters & Numbers" valid={checks.mixed} />
        <RuleItem label="Not Name/Email" valid={checks.notName} />
      </div>
    </div>
  );
};

const RuleItem = ({ label, valid }) => (
  <div className={`flex items-center gap-1 text-[10px] ${valid ? 'text-orange-400' : 'text-slate-500'}`}>
    {valid ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-600"></div>}
    {label}
  </div>
);

/* --- Helper: Feedback Message --- */
const FeedbackMessage = ({ data }) => {
  if (!data || !data.text) return null;

  const styles = {
    error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    success: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  };

  const activeStyle = styles[data.type] || styles.error;

  return (
    <div className={`px-4 py-3 rounded-xl text-sm border flex items-center gap-2 ${activeStyle} animate-fade-in`}>
      {data.type === 'info' && <Loader2 className="w-4 h-4 animate-spin" />}
      {data.text}
    </div>
  );
};

/* --- Shared Input Group - DARK MODE ORANGE --- */
const InputGroup = ({ icon: Icon, type, placeholder, value, onChange, togglePass }) => (
  <div className="group relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 py-4 pl-12 pr-12 font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-black/40 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:focus:ring-orange-900/20 transition-all outline-none"
    />
    {togglePass && (
      <button type="button" onClick={togglePass} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-2"><Eye className="w-5 h-5" /></button>
    )}
  </div>
);

/* --- Login Form --- */
export const LoginForm = ({ setMode, onSubmit, feedback }) => {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPass, setShowPass] = useState(false);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit("login", form); }} className="space-y-5">
      <div className="mb-6 mt-6">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors">Welcome Back</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Manage your wealth securely.</p>
      </div>

      <FeedbackMessage data={feedback} />

      <InputGroup icon={Mail} type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <InputGroup icon={Lock} type={showPass ? "text" : "password"} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} togglePass={() => setShowPass(!showPass)} />

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.remember} onChange={e => setForm({ ...form, remember: e.target.checked })} className="accent-orange-500 w-4 h-4 rounded appearance-none checked:bg-orange-500 bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 transition-colors" />
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">Remember Me</span>
        </label>
        <button type="button" onClick={() => setMode("forgot")} className="text-sm font-bold text-orange-400 hover:underline">Forgot Password?</button>
      </div>
      <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 dark:shadow-orange-900/20 transition-all">Secure Sign In</button>
      <div className="text-center pt-6 text-sm text-slate-500 dark:text-slate-500 font-medium transition-colors">New to Finex? <button type="button" onClick={() => setMode("signup")} className="font-bold text-orange-500 dark:text-orange-400 ml-1 hover:underline transition-colors">Open Account</button></div>
    </form>
  );
};

/* --- Signup Form --- */
export const SignupForm = ({ setMode, onSubmit, feedback }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", terms: false });
  const [showPass, setShowPass] = useState(false);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit("signup", form); }} className="space-y-4">
      <div className="mb-4 mt-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 transition-colors">Join Finex</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Start your financial journey.</p>
      </div>

      <FeedbackMessage data={feedback} />

      <InputGroup icon={User} type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <InputGroup icon={Mail} type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

      <div>
        <InputGroup icon={Lock} type={showPass ? "text" : "password"} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} togglePass={() => setShowPass(!showPass)} />
        <PasswordStrengthMeter password={form.password} userData={{ name: form.name, email: form.email }} />
      </div>

      <InputGroup icon={Lock} type={showPass ? "text" : "password"} placeholder="Confirm Password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />

      <label className="flex items-center gap-2 cursor-pointer select-none py-2">
        <input type="checkbox" checked={form.terms} onChange={e => setForm({ ...form, terms: e.target.checked })} className="accent-orange-500 w-4 h-4 rounded appearance-none checked:bg-orange-500 bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 transition-colors" />
        <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors">I agree to <span className="text-orange-500 dark:text-orange-400 font-bold transition-colors">Terms & Conditions</span></span>
      </label>
      <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-orange-900/20 transition-all">Create Account</button>
      <div className="text-center pt-4 text-sm text-slate-500 font-medium">Member? <button type="button" onClick={() => setMode("login")} className="font-bold text-orange-400 ml-1">Log In</button></div>
    </form>
  );
};


/* --- OTP Form --- */
export const OtpForm = ({ setMode, onSubmit, isReset = false, feedback }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResendClick = () => {
    if (resendTimer === 0) {
      onSubmit("resend-otp");
      setResendTimer(30);
    }
  };

  const handleChange = (i, v) => {
    if (isNaN(v)) return;
    const newOtp = [...otp]; newOtp[i] = v; setOtp(newOtp);
    if (v && i < 5) refs.current[i + 1].focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      refs.current[i - 1].focus();
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(isReset ? "verify-reset" : "verify-otp", otp.join("")); }} className="space-y-6">
      <div className="mb-6 mt-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors">
          {isReset ? "Verify Identity" : "Security Check"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Enter the 6-digit code sent to your email.</p>
      </div>

      <FeedbackMessage data={feedback} />

      <div className="flex gap-2 justify-center">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={el => refs.current[i] = el}
            type="text"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-bold border border-slate-200 dark:border-white/20 rounded-xl bg-white dark:bg-black/30 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:focus:ring-orange-900/20 transition-all outline-none shadow-sm"
          />
        ))}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendClick}
          disabled={resendTimer > 0}
          className={`text-sm font-bold flex items-center justify-center gap-2 mx-auto ${resendTimer > 0 ? "text-slate-400 dark:text-slate-500 cursor-not-allowed" : "text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300"} transition-colors`}
        >
          {resendTimer > 0 ? (
            `Resend Code in ${resendTimer}s`
          ) : (
            <>
              <RefreshCw className="w-4 h-4" /> Resend Code
            </>
          )}
        </button>
      </div>

      <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-orange-900/20 transition-all">
        {isReset ? "Verify & Reset" : "Verify Account"}
      </button>

      <button type="button" onClick={() => setMode("login")} className="w-full text-center text-slate-500 font-bold hover:text-slate-300">
        Cancel
      </button>
    </form>
  );
};

/* --- Forgot Password Form --- */
export const ForgotForm = ({ setMode, onSubmit, feedback }) => {
  const [email, setEmail] = useState("");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit("forgot", { email }); }} className="space-y-6">
      <div className="mb-6 mt-4">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors">Recover Access</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Enter your email to receive a reset code.</p>
      </div>

      <FeedbackMessage data={feedback} />

      <InputGroup icon={Mail} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />

      <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-orange-900/20 transition-all">Send Reset Code</button>

      <button type="button" onClick={() => setMode("login")} className="w-full text-center flex items-center justify-center gap-2 text-slate-500 font-bold hover:text-slate-300 mt-4">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </button>
    </form>
  );
};

/* --- Reset Password Form --- */
export const ResetForm = ({ setMode, onSubmit, feedback }) => {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const storedEmail = sessionStorage.getItem("pendingEmail") || "";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit("reset-password", form); }} className="space-y-4">
      <div className="mb-4 mt-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 transition-colors">Set Password</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Create a secure new password.</p>
      </div>

      <FeedbackMessage data={feedback} />

      <div>
        <InputGroup icon={Lock} type={showPass ? "text" : "password"} placeholder="New Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} togglePass={() => setShowPass(!showPass)} />
        <PasswordStrengthMeter password={form.password} userData={{ email: storedEmail }} />
      </div>

      <InputGroup icon={Lock} type={showPass ? "text" : "password"} placeholder="Confirm Password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />

      <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-orange-900/20 transition-all mt-4">
        Update Password
      </button>
    </form>
  );
};

export const SplashViewContent = ({ setMode }) => (
  <div className="space-y-4">
    <button onClick={() => setMode("login")} className="group w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-lg shadow-lg shadow-orange-500/20 dark:shadow-orange-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
      Access Dashboard <ChevronRight className="w-5 h-5" />
    </button>
    <button onClick={() => setMode("signup")} className="w-full py-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 text-slate-900 dark:text-white font-bold text-lg hover:bg-white/60 dark:hover:bg-white/10 transition-all">Open Account</button>
  </div>
);