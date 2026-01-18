import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard'; // (From previous response)
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Bills from './pages/Bills';
import Budgets from './pages/Budgets';
import Rewards from './pages/Rewards';
import Alerts from './pages/Alerts';
import Insights from './pages/Insights';
import Settings from './pages/Settings';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Route */}
            {/* Root Route - Auth/Splash Page */}
            <Route path="/" element={<AuthPage />} />



            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="bills" element={<Bills />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="insights" element={<Insights />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;