import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCreditCard, FiList, FiCalendar, FiPieChart, FiGift, FiBell, FiLogOut, FiMenu, FiX, FiSettings, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; // IMPORT useAuth
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api';
import { toast } from 'sonner';




export default function DashboardLayout() {
  const { logout, user } = useAuth(); // GET REAL USER DATA
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [hasNewAlerts, setHasNewAlerts] = React.useState(false);

  // Global Navigation State
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [targetPage, setTargetPage] = React.useState('');

  // Auto-Pay Poller
  React.useEffect(() => {
    const checkAutoPay = async () => {
      try {
        const res = await api.post('/bills/check-autopay');
        if (res.data && res.data.length > 0) {
          setHasNewAlerts(true);
          res.data.forEach(bill => {
            toast.success(`Bill for ${bill.biller_name} (Rs. ${bill.amount_due}) has been auto-paid!`, {
              duration: 8000,
              icon: '🔔',
              style: {
                border: '1px solid #10b981',
                background: '#064e3b',
                color: '#ecfdf5'
              }
            });
          });
        }
      } catch (error) {
        console.error("Auto-pay check failed", error);
      }
    };

    const timer = setInterval(checkAutoPay, 60000);
    checkAutoPay();

    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    // Only trap if we are on the main dashboard page
    if (location.pathname === '/dashboard') {
      // Push a dummy state so that when user clicks back, they pop this state but stay on the page
      window.history.pushState(null, document.title, window.location.href);

      const handlePopState = (event) => {
        // Prevent default back behavior by pushing state again
        window.history.pushState(null, document.title, window.location.href);
        // Show the logout confirmation
        setShowLogoutModal(true);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [location.pathname]);

  // Delayed Navigation Handler
  const handleNavigation = (path) => {
    if (location.pathname === path) return; // Don't navigate if already there

    // Extract Page Name for Display
    const segment = path.split('/').pop();
    const cleanName = !segment || segment === 'dashboard' ? 'DASHBOARD' : segment.toUpperCase();

    setTargetPage(cleanName);
    setIsNavigating(true);
    setMobileMenuOpen(false); // Close mobile menu if open

    setTimeout(() => {
      setIsNavigating(false);
      navigate(path);
    }, 700); // 0.7s Delay
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    setTargetPage('LOGGING OUT');
    setIsNavigating(true);
    setTimeout(() => {
      logout();
      navigate('/', { replace: true });
      setIsNavigating(false);
    }, 700);
  };

  const getPageName = (path) => {
    const segment = path.split('/').pop();
    if (!segment || segment === 'dashboard') return 'Dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };
  const currentPage = getPageName(location.pathname);

  /* Alerts Fetching Logic */
  const [alertCount, setAlertCount] = React.useState(0);

  React.useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/alerts/list');
        setAlertCount(res.data.length);
      } catch (e) { console.error("Failed to fetch alerts"); }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1019] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/30 transition-colors duration-300">

      {/* GLOBAL LOADING OVERLAY */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiLoader className="text-emerald-500 animate-pulse" />
              </div>
            </div>
            <h3 className="mt-8 text-xl font-bold text-white tracking-widest animate-pulse">Navigating...</h3>
            <p className="mt-2 text-slate-400 font-medium tracking-wide text-sm">Taking you to {targetPage.charAt(0) + targetPage.slice(1).toLowerCase()}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODERN SIDEBAR */}
      {/* MODERN SIDEBAR (Desktop) */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden lg:flex flex-col w-72 bg-white dark:bg-[#0B1019] border-r border-slate-200 dark:border-white/5 h-screen sticky top-0 z-40 shadow-xl dark:shadow-2xl transition-colors duration-300"
      >
        <SidebarContent
          setShowLogoutModal={setShowLogoutModal}
          alertCount={alertCount}
          handleNavigation={handleNavigation}
          currentPath={location.pathname}
        />
      </motion.aside>

      {/* MOBILE HEADER OVERLAY & MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 bg-white dark:bg-[#0B1019] border-r border-slate-200 dark:border-white/10 lg:hidden flex flex-col shadow-2xl transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >

              <SidebarContent
                setShowLogoutModal={setShowLogoutModal}
                isMobile={true}
                closeMobile={() => setMobileMenuOpen(false)}
                alertCount={alertCount}
                handleNavigation={handleNavigation}
                currentPath={location.pathname}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 px-8 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/90 dark:bg-[#0B1019]/90 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <FiMenu size={24} />
          </button>

          <div className="ml-auto flex items-center gap-6">
            <ThemeToggle />
            <button
              onClick={() => handleNavigation('/dashboard/alerts')}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <FiBell size={20} />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-[#0B1019]"></span>
              )}
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/settings')}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <FiSettings size={20} />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Welcome,</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                  {user?.name || "Loading..."}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-slate-100 dark:bg-[#151C2C] text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-widest shadow-lg shadow-emerald-500/20">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          <Outlet />
        </div>
      </main>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        currentPage={currentPage}
      />
    </div>
  );
}

function SidebarContent({ setShowLogoutModal, isMobile, closeMobile, alertCount = 0, handleNavigation, currentPath }) {
  // Random Gradient Logic
  const [logoGradient, setLogoGradient] = React.useState('from-emerald-400 to-teal-600');

  // Banking Tips Logic
  const [currentTip, setCurrentTip] = React.useState(0);
  const tips = [
    "Tip: Save 20% of your income.",
    "Tip: Track daily expenses.",
    "Tip: Review subscriptions monthly.",
    "Tip: Build an emergency fund.",
    "Tip: Invest for the long term."
  ];

  React.useEffect(() => {
    const gradients = [
      'from-emerald-400 to-teal-600',
      'from-violet-500 to-fuchsia-600',
      'from-rose-500 to-orange-500',
      'from-cyan-400 to-blue-600',
      'from-amber-400 to-orange-600'
    ];
    // Pick a random gradient on mount
    const random = gradients[Math.floor(Math.random() * gradients.length)];
    setLogoGradient(random);
  }, []);

  // Cycle tips every 3.5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="p-8 flex items-center gap-4">
        <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${logoGradient} flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-black/20 group cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:rotate-3`}>
          {/* Inner Shine Effect */}
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 skew-y-12"></div>
          <span className="relative z-10 font-black tracking-tighter">F</span>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 animate-text-shine bg-[length:200%_auto]">
            Finex Bank
          </h1>
          <p className="text-[10px] text-emerald-600/90 dark:text-emerald-400/90 font-bold tracking-[0.2em] uppercase mb-3">Track your insights</p>

          {/* Animated Banking Tips */}
          <div className="h-8 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTip}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.5 }}
                className="text-xs text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed"
              >
                {tips[currentTip]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
        {[
          { label: 'Dashboard', link: '/dashboard', icon: FiPieChart },
          { label: 'Accounts', link: '/dashboard/accounts', icon: FiCreditCard },
          { label: 'Transactions', link: '/dashboard/transactions', icon: FiList },
          { label: 'Bill Pay', link: '/dashboard/bills', icon: FiCalendar },
          { label: 'Insights', link: '/dashboard/insights', icon: FiPieChart },
          { label: 'Budgets', link: '/dashboard/budgets', icon: FiPieChart },
          { label: 'Rewards', link: '/dashboard/rewards', icon: FiGift },
          { label: 'Alerts', link: '/dashboard/alerts', icon: FiBell },
        ].map((item) => {
          // Manual isActive check since we aren't using NavLink
          const isActive = currentPath === item.link || (item.link !== '/dashboard' && currentPath.startsWith(item.link));

          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.link)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group font-medium text-sm relative overflow-hidden ${isActive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`
              }
            >
              <div className="relative">
                <item.icon className="w-5 h-5 relative z-10 transition-transform group-hover:scale-110 duration-300" />
                {item.label === 'Alerts' && alertCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0B1019] animate-pulse"></span>
                )}
              </div>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-300">
                {item.label}
              </span>
              {item.label === 'Alerts' && alertCount > 0 && (
                <span className="ml-auto bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-rose-500/20">{alertCount}</span>
              )}
              {/* Subtle hover gleam effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#0B1019]/50 transition-colors duration-300">
        <button
          onClick={() => {
            if (isMobile) closeMobile();
            setShowLogoutModal(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-rose-900/20 group text-sm"
        >
          <FiLogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>LOG OUT</span>
        </button>
      </div>
    </>
  );
}

function LogoutConfirmationModal({ isOpen, onClose, onConfirm, currentPage }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-[#0B1019] border border-white/10 rounded-3xl shadow-2xl p-8 overflow-hidden"
          >
            {/* Glossy Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl"></div>

            <div className="relative text-center z-10">
              <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <FiLogOut className="w-9 h-9 text-rose-500" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Log Out?</h3>
              <p className="text-slate-400 mb-2 font-medium text-lg leading-relaxed">
                You are currently on <span className="text-emerald-400 font-bold">{currentPage}</span>.
              </p>
              <p className="text-slate-500 mb-8 text-sm">
                Are you sure you want to terminate your session?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 px-6 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-bold border border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:from-rose-500 hover:to-rose-400 transition-all font-bold shadow-lg shadow-rose-900/30 hover:shadow-rose-900/50 hover:-translate-y-0.5"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}