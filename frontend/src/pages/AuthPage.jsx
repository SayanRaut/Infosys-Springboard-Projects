
// src/pages/AuthPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout, { FinexLogo } from "../pages/AuthLayout";
import { LoginForm, SignupForm, OtpForm, ForgotForm, ResetForm, SplashViewContent } from "../pages/AuthForms";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import MagnetLines from "../components/animations/MagnetLines";
import PillNav from "../components/animations/PillNav";
import ThemeToggle from "../components/ThemeToggle";
import BankingIconsBackground from "../components/animations/BankingIconsBackground";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setModeState] = useState("splash");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // --- SESSION STATE (Persist on Refresh) ---
  const [pendingEmail, setPendingEmailState] = useState(() => sessionStorage.getItem("pendingEmail") || "");
  const [verifiedOtp, setVerifiedOtpState] = useState(() => sessionStorage.getItem("verifiedOtp") || "");

  const { login } = useAuth();

  // Helper to update state AND sessionStorage
  const setPendingEmail = (email) => {
    sessionStorage.setItem("pendingEmail", email);
    setPendingEmailState(email);
  };

  const setVerifiedOtp = (otp) => {
    sessionStorage.setItem("verifiedOtp", otp);
    setVerifiedOtpState(otp);
  };

  // Helper: Set 2 Minute Expiry Timer
  const setExpiryTimer = () => {
    const expiryTime = Date.now() + (2 * 60 * 1000);
    sessionStorage.setItem("otpExpiry", expiryTime.toString());
  };

  const clearSessionData = () => {
    sessionStorage.removeItem("pendingEmail");
    sessionStorage.removeItem("verifiedOtp");
    sessionStorage.removeItem("otpExpiry");
    setPendingEmailState("");
    setVerifiedOtpState("");
  };

  const setMode = (newMode) => {
    setModeState(newMode);
    window.location.hash = newMode === "splash" ? "" : newMode;
    setFeedback(null);
  };

  // --- STRICT PASSWORD VALIDATOR ---
  const validatePassword = (password, name = "", email = "") => {
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must include a special character (!@#...).";
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) return "Password must mix letters and numbers.";

    const passLower = password.toLowerCase();

    if (name) {
      const nameParts = name.toLowerCase().split(" ");
      for (let part of nameParts) {
        if (part.length > 2 && passLower.includes(part)) return "Password cannot contain parts of your name.";
      }
    }

    if (email) {
      const emailPart = email.split("@")[0].toLowerCase();
      if (emailPart.length > 2 && passLower.includes(emailPart)) return "Password cannot contain your email/username.";
    }

    return null;
  };

  // --- SECURITY & TIMER CHECK ---
  useEffect(() => {
    const handleCheck = () => {
      const hash = window.location.hash.replace("#", "");
      const needsEmail = ["verify-signup", "verify-reset", "verify-otp"];
      const needsOtp = ["reset-password"];

      const storedEmail = sessionStorage.getItem("pendingEmail");
      const storedOtp = sessionStorage.getItem("verifiedOtp");
      const expiry = sessionStorage.getItem("otpExpiry");

      if (needsEmail.includes(hash) && !storedEmail) {
        handleSessionExpire("Session data lost. Please login.");
        return;
      }

      if (needsOtp.includes(hash) && (!storedOtp || !storedEmail)) {
        handleSessionExpire("Session data lost. Please login.");
        return;
      }

      if (needsEmail.includes(hash)) {
        if (expiry && Date.now() > parseInt(expiry)) {
          handleSessionExpire("Session expired (2 min limit). Please try again.");
          return;
        }
      }

      if (hash && hash !== mode) setModeState(hash);
    };

    const handleSessionExpire = (msg) => {
      if (window.location.hash !== "#login" && window.location.hash !== "") {
        clearSessionData();
        setModeState("login");
        window.location.hash = "login";
        setFeedback({ type: "error", text: msg });
      }
    };

    handleCheck();
    const interval = setInterval(handleCheck, 1000);
    window.addEventListener("hashchange", handleCheck);

    return () => {
      window.removeEventListener("hashchange", handleCheck);
      clearInterval(interval);
    };
  }, [mode]);

  const handleAuthSubmit = async (action, data) => {
    setFeedback(null);
    setIsLoading(true);

    try {
      if (action === "login") {
        if (!data.email || !data.password) throw new Error("Please fill in your credentials.");
        const result = await login(data.email, data.password);
        if (result.success) {
          clearSessionData();
          navigate("/dashboard");
        }
        else setFeedback({ type: "error", text: result.message || "Login failed" });
      }

      else if (action === "signup") {
        if (!data.name || !data.email || !data.password || !data.terms) throw new Error("Please complete form.");
        if (data.password !== data.confirm) throw new Error("Passwords do not match.");
        const passError = validatePassword(data.password, data.name, data.email);
        if (passError) throw new Error(passError);
        await api.post("/auth/register", {
          name: data.name, email: data.email, password: data.password, phone: data.phone
        });
        setPendingEmail(data.email);
        setExpiryTimer();
        setFeedback({ type: "success", text: "Account created! Check email for code." });
        setMode("verify-signup");
      }

      else if (action === "resend-otp") {
        const currentEmail = sessionStorage.getItem("pendingEmail");
        if (!currentEmail) throw new Error("Session lost. Please start over.");
        if (mode === "verify-reset") await api.post("/auth/forgot-password", { email: currentEmail });
        else await api.post("/auth/resend-otp", { email: currentEmail });
        setExpiryTimer();
        setFeedback({ type: "success", text: "Code resent! You have 2 more minutes." });
      }

      else if (action === "verify-otp" || action === "verify-reset") {
        const currentEmail = sessionStorage.getItem("pendingEmail");
        if (!currentEmail) throw new Error("Session expired. Please start over.");
        const expiry = sessionStorage.getItem("otpExpiry");
        if (expiry && Date.now() > parseInt(expiry)) throw new Error("Time limit exceeded. Session expired.");

        try {
          await api.post("/auth/verify-otp", { email: currentEmail, otp: data });
          if (action === "verify-reset") {
            setVerifiedOtp(data);
            setMode("reset-password");
            setFeedback({ type: "success", text: "Identity Verified. Set new password." });
          } else {
            clearSessionData();
            setMode("login");
            setFeedback({ type: "success", text: "Verified! Please login." });
          }
        } catch (apiError) {
          const msg = apiError.response?.data?.detail || "Invalid OTP code.";
          setFeedback({ type: "error", text: msg });
          return;
        }
      }

      else if (action === "forgot") {
        if (!data.email) throw new Error("Please enter your email.");
        await api.post("/auth/forgot-password", { email: data.email });
        setPendingEmail(data.email);
        setExpiryTimer();
        setMode("verify-reset");
        setFeedback({ type: "success", text: "Code sent to your email." });
      }

      else if (action === "reset-password") {
        if (data.password !== data.confirm) throw new Error("Passwords do not match.");
        const currentEmail = sessionStorage.getItem("pendingEmail");
        const currentOtp = sessionStorage.getItem("verifiedOtp");
        const passError = validatePassword(data.password, "", currentEmail);
        if (passError) throw new Error(passError);
        await api.post("/auth/reset-password", { email: currentEmail, otp: currentOtp, new_password: data.password });
        setFeedback({ type: "success", text: "Password updated! Login now." });
        setTimeout(() => {
          clearSessionData();
          setMode("login");
        }, 2000);
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "Something went wrong";
      if (msg.includes("Session expired") || msg.includes("Time limit")) {
        clearSessionData();
        setMode("login");
      }
      setFeedback({ type: "error", text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  /* --- RENDER --- */
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white">
      {/* Theme Toggle - Top Right (Visible when NOT in Splash mode) */}
      {mode !== "splash" && (
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>
      )}

      {/* Global Background - DARK THEME + MAGNET LINES + BANKING ICONS */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        <MagnetLines
          rows={20}
          columns={20}
          containerSize="150vmax"
          lineColor="rgba(234, 88, 12, 0.2)" /* Orange-600 opacity */
          lineWidth="2px"
          lineHeight="25px"
          baseAngle={0}
        />
      </div>
      <BankingIconsBackground />

      {mode === "splash" ? (
        <div className="w-full max-w-lg mx-auto bg-white/40 dark:bg-black/40 backdrop-blur-[20px] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1),0_0_60px_-10px_rgba(234,88,12,0.2)] p-10 relative z-30 border border-white/20 dark:border-white/10 transition-all duration-500">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="p-4 bg-white/40 dark:bg-white/5 rounded-2xl shadow-sm border border-white/20 dark:border-white/5 transition-colors"><FinexLogo size={56} color="default" /></div>
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white transition-colors">Finex Bank</h1>
              <p className="text-orange-600 dark:text-orange-200 font-medium mt-2 text-lg transition-colors">Wealth Management Redefined</p>
            </div>
          </div>
          <SplashViewContent setMode={setMode} />
        </div>
      ) : (
        <div className="relative z-30 w-full transition-all duration-500">
          <AuthLayout onSplashClick={() => setMode("splash")}>
            {mode === "login" && <LoginForm setMode={setMode} onSubmit={handleAuthSubmit} feedback={feedback} />}
            {mode === "signup" && <SignupForm setMode={setMode} onSubmit={handleAuthSubmit} feedback={feedback} />}
            {mode === "verify-signup" && <OtpForm setMode={setMode} onSubmit={handleAuthSubmit} feedback={feedback} />}
            {mode === "forgot" && <ForgotForm setMode={setMode} onSubmit={handleAuthSubmit} feedback={feedback} />}
            {mode === "verify-reset" && <OtpForm setMode={setMode} onSubmit={handleAuthSubmit} isReset={true} feedback={feedback} />}
            {mode === "reset-password" && <ResetForm setMode={setMode} onSubmit={handleAuthSubmit} feedback={feedback} />}
          </AuthLayout>
        </div>
      )}

      {/* Footer Branding - Dark */}
      {/* Header Branding & Navigation */}
      {mode === "splash" && (
        <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-40 pointer-events-none">
          {/* Left: Shiny Logo */}
          <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 dark:border-white/10 shadow-lg pointer-events-auto transition-colors">
            <FinexLogo size={28} color="default" />
            <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-slate-800 via-orange-600 to-slate-500 dark:from-white dark:via-orange-300 dark:to-slate-400 bg-clip-text text-transparent drop-shadow-sm transition-colors">Finex Bank</span>
          </div>

          {/* Right: Toggle & Pill Navigation */}
          <div className="pointer-events-auto flex items-center gap-4">
            <ThemeToggle />
            <PillNav
              showLogo={false}
              wrapperClassName="relative"
              items={[
                { label: 'Login', href: '#login' },
                { label: 'Register', href: '#signup' }
              ]}
              activeHref={`#${mode}`}
              baseColor="rgba(15, 23, 42, 0.6)"
              pillColor="#ea580c"
              pillTextColor="#cbd5e1"
              hoveredPillTextColor="#ffffff"
            />
          </div>
        </div>
      )}
    </div>
  );
}