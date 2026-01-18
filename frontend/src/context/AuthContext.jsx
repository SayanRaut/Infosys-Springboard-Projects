// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Session restore failed", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.access_token);

            // Fetch user details immediately after login to populate full user object
            try {
                const meRes = await api.get('/auth/me');
                setUser(meRes.data);
            } catch (e) {
                console.error("Failed to fetch user profile", e);
                setUser({ email }); // Fallback
            }

            return { success: true };
        } catch (error) {
            console.error("Login Error:", error);
            return {
                success: false,
                message: error.response?.data?.detail || "Login failed"
            };
        }
    };

    const updateProfile = async (data) => {
        try {
            const response = await api.put('/auth/me', data);
            setUser(response.data); // Update local state immediately
            return { success: true };
        } catch (error) {
            console.error("Profile update failed", error);
            return {
                success: false,
                message: error.response?.data?.detail || "Update failed"
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        // Clear auth-related session flow data
        sessionStorage.removeItem('pendingEmail');
        sessionStorage.removeItem('verifiedOtp');
        sessionStorage.removeItem('otpExpiry');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);