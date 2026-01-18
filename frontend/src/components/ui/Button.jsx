import React from 'react';
import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

export default function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  onClick, 
  type = 'button',
  className = "" 
}) {
  const baseStyle = "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a]";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/20 focus:ring-blue-500",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-500",
    danger: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 focus:ring-rose-500"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`${baseStyle} ${variants[variant]} ${className} ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
    >
      {isLoading && <FiLoader className="animate-spin" />}
      {children}
    </motion.button>
  );
}