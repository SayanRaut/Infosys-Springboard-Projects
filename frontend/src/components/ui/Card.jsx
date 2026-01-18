import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ children, className = "", onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
      className={`bg-[#1e293b]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/10 ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}