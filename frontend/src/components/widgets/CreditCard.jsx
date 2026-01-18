import React from 'react';
import { motion } from 'framer-motion';
import { FiWifi } from 'react-icons/fi';

export default function CreditCard({ balance, holder, expiry }) {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-56 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-800 p-6 text-white shadow-2xl shadow-indigo-900/40 overflow-hidden border border-white/10"
    >
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Current Balance</p>
            <h3 className="text-3xl font-bold tracking-tight">Rs. {balance?.toLocaleString()}</h3>
          </div>
          <FiWifi className="rotate-90 text-white/50" size={24} />
        </div>

        <div className="flex items-center gap-4 mt-4">
          {/* Chip */}
          <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-yellow-200 to-yellow-500 border border-yellow-600/50 shadow-inner"></div>
          <FiWifi className="text-white/50" size={20} />
        </div>

        <div className="flex justify-between items-end mt-auto">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Card Holder</p>
            <p className="font-medium tracking-wide">{holder}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Expires</p>
            <p className="font-medium tracking-wide">{expiry}</p>
          </div>
          {/* Mastercard Logo Sim */}
          <div className="flex -space-x-3">
            <div className="w-8 h-8 rounded-full bg-white/80"></div>
            <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}