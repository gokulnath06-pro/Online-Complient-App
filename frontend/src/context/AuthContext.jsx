import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from token
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token: newToken, user: authUser } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(authUser);
      return { success: true, user: authUser };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Invalid credentials or server error';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      const { token: newToken, user: authUser } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(authUser);
      return { success: true, user: authUser };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please check inputs.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // 1-Click Fast Login for Demonstration
  const fastDemoLogin = async (role) => {
    let email = 'john@user.com';
    let password = 'user123';

    if (role === 'ADMIN') {
      email = 'admin@complaint.com';
      password = 'admin123';
    } else if (role === 'AGENT') {
      email = 'agent.tech@complaint.com';
      password = 'agent123';
    } else if (role === 'USER') {
      email = 'john@user.com';
      password = 'user123';
    }

    return await login(email, password);
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isAgent: user?.role === 'AGENT',
    isUser: user?.role === 'USER',
    login,
    register,
    logout,
    fastDemoLogin,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
