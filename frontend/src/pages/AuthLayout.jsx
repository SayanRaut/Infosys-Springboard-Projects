// src/components/AuthLayout.jsx
import React, { useState, useEffect } from "react";
import { Wifi, ShieldCheck } from "lucide-react";
import { useMousePosition } from "../hooks/useMousePosition";


/* --- Visual Components --- */
export const FinexLogo = ({ size = 28, color = "default" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <defs>
      <linearGradient id="logoGrad" x1="0" x2="1" y1="0" y2="1">
        {/* Indigo Gradient for 'default', White for 'white' */}
        <stop offset="0" stopColor={color === "white" ? "#fff" : "#6366f1"} />
        <stop offset="1" stopColor={color === "white" ? "#c7d2fe" : "#4f46e5"} />
      </linearGradient>
    </defs>
    {/* Stroke colors matched to Indigo */}
    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="url(#logoGrad)" stroke={color === "white" ? "#6366f1" : "none"} strokeWidth="0" />
    <path d="M12 22V12" stroke={color === "white" ? "#6366f1" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 12L22 7" stroke={color === "white" ? "#6366f1" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 12L2 7" stroke={color === "white" ? "#6366f1" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const OrbitingCards = () => {
  const cards = [
    { id: 1, bg: "bg-black/90", text: "text-slate-300", border: "border-slate-800", num: "8899", delay: "0s" },
    // Changed to Orange/Red
    { id: 2, bg: "bg-gradient-to-br from-orange-600 to-red-700", text: "text-white", border: "border-orange-600", num: "4021", delay: "-5s" },
    { id: 3, bg: "bg-slate-900/90 backdrop-blur-md", text: "text-white", border: "border-white/20", num: "1190", delay: "-10s" },
  ];
  return (
    <div className="fixed bottom-32 left-32 z-20 hidden md:block w-0 h-0 hover:scale-105 transition-transform duration-700">
      <div className="relative w-0 h-0">
        {cards.map((c) => (
          <div key={c.id} className="absolute top-0 left-0" style={{ transform: `rotate(${parseFloat(c.delay) * -24}deg)` }}>
            <div className="w-[200px] h-[125px] perspective-1000" style={{ position: 'absolute', top: '-60px', left: '-100px', animation: `orbit 20s linear infinite`, animationDelay: c.delay }}>
              <div className="relative w-full h-full transition-transform duration-500 transform-style-3d animate-flip-interval" style={{ animationDelay: c.delay }}>
                <div className={`absolute inset-0 backface-hidden rounded-2xl p-5 shadow-2xl flex flex-col justify-between ${c.bg} ${c.text} border ${c.border} opacity-95`}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 animate-shimmer"></div>
                  <div className="flex justify-between items-start z-10"><FinexLogo size={22} color="white" /><Wifi className="w-5 h-5 rotate-90 opacity-80" /></div>
                  <div className="z-10"><span className="font-mono text-lg tracking-widest opacity-90">•••• {c.num}</span></div>
                </div>
                <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-black text-white shadow-2xl overflow-hidden border border-slate-800`}>
                  <div className="w-full h-8 bg-slate-900 mt-4"></div>
                  <div className="px-5 mt-3 flex items-center justify-between"><ShieldCheck className="w-5 h-5 text-orange-500" /><span className="text-[10px] italic">CVV</span></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --- Carousel Data --- */
import Slide1 from "../assets/auth_slide_1.png";
import Slide2 from "../assets/auth_slide_2.png";
import Slide3 from "../assets/auth_slide_3.png";

const CAROUSEL_IMAGES = [Slide1, Slide2, Slide3];

/* --- Rotating Text Component --- */
const FlowingText = () => {
  const messages = [
    "Unified dashboard for stocks, crypto & fiat.",
    "Real-time asset allocation visualization.",
    "Smart predictive budgeting with AI.",
    "Instant cross-border wealth transfers.",
    "Institutional-grade security.",
    "Track live market movements effortlessly."
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000); // Increased duration to sync with image
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="h-16 relative overflow-hidden flex items-center justify-center">
      {messages.map((msg, i) => (
        <p
          key={i}
          className={`absolute top-0 left-0 w-full text-orange-200 font-medium leading-relaxed transition-all duration-1000 transform text-center
            ${i === index ? "opacity-100 translate-y-0 scale-100 blur-0" : "opacity-0 translate-y-4 scale-95 blur-[2px]"}
          `}
        >
          {msg}
        </p>
      ))}
    </div>
  );
};

/* --- Main Layout Wrapper --- */
export default function AuthLayout({ children, onSplashClick }) {
  const { x = 0, y = 0 } = useMousePosition();
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1;
  const parallaxX = (x / vw - 0.5) * 12;
  const parallaxY = (y / vh - 0.5) * 12;

  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000); // 5 Seconds Rotation
    return () => clearInterval(timer);
  }, []);

  const styles = `
    @keyframes orbit { 0% { transform: rotate(0deg) translateX(160px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(160px) rotate(-360deg); } }
    @keyframes flip-interval { 0%, 60% { transform: rotateY(0deg); } 70%, 100% { transform: rotateY(180deg); } }
    @keyframes float { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } 100% { transform: translateY(0px) rotate(0deg); } }
    @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes shimmer { 0%, 90% { transform: translateX(-150%) skewX(-15deg); opacity:0; } 50% { opacity: 0.5; } 100% { transform: translateX(150%) skewX(-15deg); opacity:0; } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-slow { animation: float 8s ease-in-out infinite; }
    .animate-float-delayed { animation: float 7s ease-in-out 2s infinite; }
    .animate-ticker { animation: ticker 40s linear infinite; }
    .animate-shimmer { animation: shimmer 4s infinite; }
    .transform-style-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
  `;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-transparent relative overflow-hidden">
      <style>{styles}</style>
      <OrbitingCards />

      {/* Main Container with Dark Glass */}
      <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-[30px] w-full max-w-[1080px] min-h-[680px] rounded-[32px] 
                      shadow-[0_30px_60px_-12px_rgba(0,0,0,0.1),0_0_80px_-20px_rgba(234,88,12,0.2)] dark:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5),0_0_80px_-20px_rgba(234,88,12,0.4)] 
                      border border-white/40 dark:border-white/10 
                      overflow-hidden flex flex-col md:flex-row z-30 transition-colors duration-500">

        {/* Left Panel - ORANGE THEME (Always Orange, but inputs/details may vary) */}
        <div className="w-full md:w-[45%] bg-gradient-to-br from-orange-500 via-amber-600 to-red-700 relative overflow-hidden flex flex-col items-center justify-center p-10 text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          {/* IMAGE CAROUSEL WITH PARALLAX */}
          <div className="relative z-10 w-[280px] h-[350px] transition-transform duration-100 ease-out" style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)` }}>
            {CAROUSEL_IMAGES.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Finex illustration ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover rounded-2xl shadow-xl shadow-orange-900/20 border-4 border-white/20 transition-opacity duration-1000 ease-in-out
                    ${index === activeSlide ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                  `}
              />
            ))}
          </div>

          {/* Flowing Text Section */}
          <div className="mt-10 text-center relative z-10 w-full max-w-xs">
            <h3 className="text-3xl font-bold mb-3 tracking-tight text-white shadow-sm">Financial Freedom</h3>
            <FlowingText />
          </div>
        </div>

        {/* Right Panel (Forms) - Transparent */}
        <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center bg-transparent relative z-50">

          {/* MOVED LOGO HERE */}
          <div className="flex items-center gap-3 mb-2" onClick={onSplashClick}>
            <div className="w-10 h-10 bg-orange-100 dark:bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-orange-200 dark:border-white/10 cursor-pointer transition-colors">
              <FinexLogo size={20} color="default" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-wide text-lg text-slate-800 dark:text-white leading-none transition-colors">Finex Bank</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider transition-colors">Wealth Management</span>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}