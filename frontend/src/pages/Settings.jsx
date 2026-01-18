import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiMail, FiSave, FiCheck, FiSettings, FiBell, FiShield, FiMoon, FiPhone, FiLock, FiSmartphone, FiSun, FiLogOut } from 'react-icons/fi';
import { toast } from 'sonner';

export default function Settings() {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // Split name logic
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('+91 98765 43210'); // Mock phone
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (user?.name) {
            const parts = user.name.split(' ');
            setFirstName(parts[0]);
            setLastName(parts.slice(1).join(' '));
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fullName = `${firstName} ${lastName}`.trim();
            const result = await updateProfile({ name: fullName, email });
            if (result.success) {
                toast.success('Profile updated successfully!');
            } else {
                toast.error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: FiUser },
        // { id: 'notifications', label: 'Notifications', icon: FiBell }, // REMOVED
        { id: 'security', label: 'Security', icon: FiShield },
        { id: 'appearance', label: 'Appearance', icon: FiMoon },
    ];

    return (
        <div className="p-6 lg:p-10 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                        <FiSettings />
                    </div>
                    Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 ml-16">Manage your account preferences and profile details.</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* SIDEBAR TABS */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full lg:w-64 space-y-2"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20'
                                : 'bg-white dark:bg-[#151C2C] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5'
                                }`}
                        >
                            <tab.icon className={activeTab === tab.id ? 'animate-pulse' : ''} />
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* MAIN CONTENT AREA */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                >
                    {/* --- PROFILE TAB --- */}
                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-[#151C2C] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <FiUser className="text-indigo-500" />
                                Personal Information
                            </h2>

                            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                                {/* AVATAR PLACEHOLDER */}
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-[#0B1019] border-4 border-white dark:border-[#151C2C] shadow-lg flex items-center justify-center text-3xl font-bold text-indigo-500 relative overflow-hidden group cursor-pointer">
                                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">Change</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo</p>
                                        <p className="text-xs text-slate-500 mb-2">JPG, GIF or PNG. Max size 800K</p>
                                        <button type="button" className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5">Upload New</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                                        <div className="relative">
                                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0B1019] border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-white"
                                                placeholder="First Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                                        <div className="relative">
                                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0B1019] border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-white"
                                                placeholder="Last Name"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                        <div className="relative">
                                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0B1019] border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-white"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                                        <div className="relative">
                                            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0B1019] border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-white"
                                                placeholder="+91 00000 00000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span> : <FiSave />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- SECURITY TAB --- */}
                    {activeTab === 'security' && (
                        <div className="bg-white dark:bg-[#151C2C] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <FiLock className="text-indigo-500" />
                                    Security Settings
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B1019] rounded-2xl border border-slate-200 dark:border-white/5">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Two-Factor Authentication</h4>
                                            <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-lg hover:bg-emerald-500 hover:text-white transition-all">Enable</button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B1019] rounded-2xl border border-slate-200 dark:border-white/5">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Change Password</h4>
                                            <p className="text-xs text-slate-500 mt-1">You will need to log out to reset your password.</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (window.confirm("You will be logged out to reset your password. Continue?")) {
                                                    logout();
                                                    navigate('/#forgot');
                                                }
                                            }}
                                            className="px-4 py-2 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-bold text-xs rounded-lg hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B1019] rounded-2xl border border-slate-200 dark:border-white/5">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Active Sessions</h4>
                                            <p className="text-xs text-slate-500 mt-1">Manage devices where you are logged in.</p>
                                        </div>
                                        <button className="px-4 py-2 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-bold text-xs rounded-lg hover:bg-slate-300 dark:hover:bg-white/20 transition-all">View All</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- APPEARANCE TAB --- */}
                    {activeTab === 'appearance' && (
                        <div className="bg-white dark:bg-[#151C2C] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <FiMoon className="text-indigo-500" />
                                Appearance
                            </h2>

                            <div className="p-6 bg-slate-50 dark:bg-[#0B1019] rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-xl shadow-sm">
                                        {theme === 'dark' ? <FiMoon className="text-indigo-400" /> : <FiSun className="text-amber-500" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</h4>
                                        <p className="text-xs text-slate-500 mt-1">Toggle between light and dark themes.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={toggleTheme}
                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                >
                                    <motion.div
                                        initial={false}
                                        animate={{ x: theme === 'dark' ? 26 : 2 }}
                                        className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-[10px]"
                                    >
                                        {theme === 'dark' ? <FiMoon className="text-indigo-500" /> : <FiSun className="text-amber-500" />}
                                    </motion.div>
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
