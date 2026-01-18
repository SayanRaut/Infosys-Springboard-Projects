import React, { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { FiSend, FiUser } from 'react-icons/fi';

export default function QuickTransfer({ recipients = [] }) {
  const [amount, setAmount] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!selectedUser || !amount) return;
    console.log(`Sending $${amount} to ${selectedUser.name}`);
    // Call API here
  };

  return (
    <Card>
      <h3 className="text-lg font-bold text-slate-200 mb-4">Quick Transfer</h3>

      {/* Recent Recipients */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-2 custom-scrollbar">
        <button
          onClick={() => setSelectedUser(null)}
          className="flex flex-col items-center gap-2 min-w-[60px]"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-colors">
            <FiUser />
          </div>
          <span className="text-xs text-slate-400">New</span>
        </button>

        {recipients.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="flex flex-col items-center gap-2 min-w-[60px] group"
          >
            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${selectedUser?.id === user.id ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'border-transparent group-hover:border-slate-500'}`}>
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} />
            </div>
            <span className={`text-xs truncate w-16 text-center ${selectedUser?.id === user.id ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
              {user.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleTransfer} className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-2.5 text-slate-400 font-bold">Rs.</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-2 pl-12 pr-4 text-white font-mono focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <Button variant="primary" type="submit" className="w-full">
          <FiSend /> Send Money
        </Button>
      </form>
    </Card>
  );
}