import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_USER } from '../data/mockOrders';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<boolean>;
  register: (name: string, mobile: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ott_sellers_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    // Default logged-in demo user for instant smooth demo experience
    return INITIAL_USER;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, [user]);

  const login = async (identifier: string): Promise<boolean> => {
    // Simulate auth
    await new Promise(r => setTimeout(r, 400));
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: identifier.includes('@') ? identifier.split('@')[0] : 'Valued Customer',
      email: identifier.includes('@') ? identifier : 'customer@example.com',
      mobile: identifier.startsWith('+') || /^\d+$/.test(identifier) ? identifier : '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      joinedDate: 'October 2026'
    };
    setUser(newUser);
    return true;
  };

  const register = async (name: string, mobile: string, email: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 400));
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name,
      email,
      mobile,
      whatsapp: mobile,
      joinedDate: 'October 2026'
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!user) return;
    setUser(prev => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
