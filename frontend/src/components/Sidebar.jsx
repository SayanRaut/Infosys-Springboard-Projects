import React from 'react';
import { LayoutDashboard, History, ArrowRightLeft, CreditCard, Settings, LogOut, Wallet } from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, isMobileOpen, setIsMobileOpen, onLogout }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
    { id: 'cards', label: 'My Cards', icon: CreditCard },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 text-indigo-600 mb-10 px-2">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-200">
              <Wallet size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">NeoBank</span>
          </div>

          <nav className="space-y-2 flex-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu</div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setIsMobileOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 pt-6">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
