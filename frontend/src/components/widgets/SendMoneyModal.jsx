import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiRefreshCw, FiUser } from 'react-icons/fi';
import SlideButton from '../ui/SlideButton';
import api from '../../services/api'; //

export default function SendMoneyModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('input');
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(''); // Changed to email for uniqueness
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSlide = async () => {
    setError('');
    setLoading(true);
    setStep('processing');

    try {
      // CALL THE BACKEND API
      const response = await api.post('/transactions/send', {
        recipient_email: recipientEmail,
        amount: parseFloat(amount),
        description: "Web Dashboard Transfer"
      });

      setTimeout(() => {
        setStep('success');
        setLoading(false);
        if (onSuccess) onSuccess(); // Refresh dashboard data
      }, 1000);

    } catch (err) {
      console.error("Transfer failed", err);
      setError(err.response?.data?.detail || "Transfer failed. Please check email and balance.");
      setStep('input'); // Go back to input
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setRecipientEmail('');
    setStep('input');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          className="relative w-full max-w-md bg-[#151C2C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><FiX size={20} /></button>

          {step === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FiCheckCircle size={60} className="text-emerald-500 mb-4" />
              <h2 className="text-2xl font-bold text-white">Transfer Successful!</h2>
              <p className="text-slate-400 mt-2">You sent <span className="text-emerald-400 font-bold">Rs. {amount}</span> to {recipientEmail}</p>
              <button onClick={() => { resetForm(); onClose(); }} className="mt-6 w-full py-3 bg-white text-slate-900 font-bold rounded-xl">Done</button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Send Money</h2>

              {error && <div className="p-3 bg-rose-500/20 text-rose-300 text-sm rounded-lg border border-rose-500/30">{error}</div>}

              <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Recipient Email</label>
                <div className="flex items-center bg-[#0B1019] border border-slate-700 rounded-xl mt-2 p-3">
                  <FiUser className="text-slate-500 mr-3" />
                  <input
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-transparent w-full text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Amount</label>
                <div className="flex items-center justify-center py-4">
                  <span className="text-3xl text-slate-500 mr-2">Rs.</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent w-40 text-center text-4xl font-bold text-white outline-none"
                  />
                </div>
              </div>

              <SlideButton
                onSlideComplete={handleSlide}
                isSuccess={loading} // Show loading state on slider
                reset={!!error}
              />
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}