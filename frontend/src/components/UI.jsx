import React, { useRef, useState } from 'react';

export const SpotlightCard = ({ children, className = "", onClick }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      onClick={onClick}
      className={`relative rounded-xl border border-slate-200 bg-white overflow-hidden transition-shadow hover:shadow-md ${className}`}
    >
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.1), transparent 40%)`
        }}
      />
      <div className="relative h-full p-6">{children}</div>
    </div>
  );
};

export const Button = ({ children, onClick, variant = "primary", isLoading, className = "", type = "button" }) => {
  const baseStyle = "px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-slate-500 hover:bg-slate-100",
  };

  return (
    <button type={type} onClick={onClick} disabled={isLoading} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
};

export const Input = ({ label, type = "text", value, onChange, placeholder, required, icon: Icon }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200`}
        placeholder={placeholder}
      />
    </div>
  </div>
);
