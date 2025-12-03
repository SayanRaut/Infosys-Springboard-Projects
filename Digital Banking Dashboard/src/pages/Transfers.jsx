import React, { useState } from 'react';
import { Wallet, User, MoreHorizontal, CheckCircle } from 'lucide-react';
import { Button, Input, SpotlightCard } from '../components/UI';
import { api } from '../utils/mockApi';

const Transfers = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await api.transferMoney(500);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Send Money</h1>
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100 animate-in fade-in">
          <CheckCircle size={24} />
          <div>
            <p className="font-bold">Transfer Successful!</p>
            <p className="text-sm opacity-90">Your funds have been sent securely.</p>
          </div>
        </div>
      )}

      <SpotlightCard>
        <form onSubmit={handleTransfer} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">From Account</label>
            <div className="relative">
              <select className="w-full p-3 pl-10 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none">
                <option>Checking (**** 4582) - $24,500.50</option>
                <option>Savings (**** 9921) - $120,500.00</option>
              </select>
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Recipient" placeholder="user@bank.com" icon={User} required />
            <Input 
              label="Amount" 
              type="number" 
              placeholder="0.00" 
              icon={() => <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>} 
              required 
            />
          </div>

          <Input label="Description (Optional)" placeholder="Dinner split, Rent, etc." icon={MoreHorizontal} />

          <div className="pt-4 border-t border-slate-100">
             <div className="flex justify-between items-center text-sm text-slate-500 mb-6">
               <span>Transfer Fee</span>
               <span className="font-medium text-slate-900">$0.00</span>
             </div>
             <Button type="submit" className="w-full py-3.5 text-lg" isLoading={loading}>
               Confirm Transfer
             </Button>
          </div>
        </form>
      </SpotlightCard>
    </div>
  );
};

export default Transfers;