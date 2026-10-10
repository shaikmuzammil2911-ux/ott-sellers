import React, { createContext, useContext, useState, useEffect } from 'react';
import { emailService } from '../services/emailService';
import { ottApi, ADMIN_CONFIG } from '../services/api';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string; resetUrl?: string }>;
  resetPassword: (token: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (existingPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_AUTH_KEY = 'ott_sellers_admin_session_v1';
const ADMIN_PASS_KEY = 'ott_sellers_admin_pwd_v1';
const RESET_TOKEN_KEY = 'ott_sellers_reset_token_v1';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_AUTH_KEY);
      if (saved) {
        setAdminUser(JSON.parse(saved));
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const isAuthorizedEmail = (email: string) => {
    const clean = email.trim().toLowerCase();
    const envAdmin = (import.meta.env.ADMIN_EMAIL || ADMIN_CONFIG.EMAIL).toLowerCase();
    return (
      clean === envAdmin ||
      clean === 'fixyourmobiles7@gmail.com' ||
      clean === 'ottsellers00@gmail.com' ||
      clean === 'ottsellers1@gmail.com'
    );
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if Supabase Auth login is used
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass
      });
      if (!error && data.user) {
        const u: AdminUser = {
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Super Admin',
          email: data.user.email || cleanEmail,
          role: 'admin'
        };
        setAdminUser(u);
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(u));
        await ottApi.logAudit('Admin Login (Supabase Auth)', 'Auth', u.id);
        return { success: true };
      }
    } catch {}

    // 2. Validate with stored custom password or defaults
    const storedPass = localStorage.getItem(ADMIN_PASS_KEY) || ADMIN_CONFIG.DEFAULT_PASS;
    
    // Also accept master passwords
    const isValidPass = 
      pass === storedPass || 
      pass === 'Fixyourmobiles@2026' || 
      pass === 'dxbzsrhqqyeyxewn' || 
      pass === 'Admin@123' || 
      pass === ADMIN_CONFIG.DEFAULT_PASS || 
      pass === 'OttSellers@2026' || 
      pass === 'wgupwtpbbczbnbhq';

    if (isAuthorizedEmail(cleanEmail) && isValidPass) {
      const u: AdminUser = {
        id: 'admin-super-1',
        name: 'Super Admin',
        email: cleanEmail,
        role: 'admin'
      };
      setAdminUser(u);
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(u));
      await ottApi.logAudit('Admin Login (Master Credentials)', 'Auth', u.id);
      return { success: true };
    }

    return { 
      success: false, 
      error: 'Invalid admin email or password. Please verify your credentials.' 
    };
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    ottApi.logAudit('Admin Logout', 'Auth', adminUser?.id);
  };

  const changePassword = async (existingPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!existingPass) {
      return { success: false, error: 'Please enter your existing password.' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const storedPass = localStorage.getItem(ADMIN_PASS_KEY) || ADMIN_CONFIG.DEFAULT_PASS;
    const isExistingValid = 
      existingPass === storedPass ||
      existingPass === 'Fixyourmobiles@2026' ||
      existingPass === 'dxbzsrhqqyeyxewn' ||
      existingPass === 'Admin@123' ||
      existingPass === ADMIN_CONFIG.DEFAULT_PASS ||
      existingPass === 'OttSellers@2026';

    if (!isExistingValid) {
      return { success: false, error: 'Incorrect existing password. Please check and try again.' };
    }

    try {
      // Try updating in Supabase Auth if session exists
      try {
        await supabase.auth.updateUser({ password: newPass });
      } catch {}

      // Update local storage secure store
      localStorage.setItem(ADMIN_PASS_KEY, newPass);
      await ottApi.logAudit('ADMIN_PASSWORD_CHANGED', 'Admin Security', adminUser?.email || ADMIN_CONFIG.EMAIL);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update administrator password.' };
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message?: string; error?: string; resetUrl?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isAuthorizedEmail(cleanEmail)) {
      return { success: false, error: 'Email address not found in authorized administrator records.' };
    }

    // Generate token
    const token = 'rst_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    const tokenData = { token, email: cleanEmail, expiresAt };
    localStorage.setItem(RESET_TOKEN_KEY, JSON.stringify(tokenData));

    // Create reset URL
    const resetUrl = `${window.location.origin}/admin/reset-password?token=${token}`;

    // Send email via SMTP
    const emailRes = await emailService.sendPasswordResetEmail(cleanEmail, resetUrl);
    
    await ottApi.logAudit('Password Reset Requested', 'Admin Security', token);

    return { 
      success: true, 
      message: emailRes.message || `Password reset link sent to ${cleanEmail}. Please check your inbox and spam folder!`,
      resetUrl
    };
  };

  const resetPassword = async (token: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    try {
      const savedToken = localStorage.getItem(RESET_TOKEN_KEY);
      if (!savedToken) {
        return { success: false, error: 'Reset token has expired or is invalid.' };
      }

      const parsed = JSON.parse(savedToken);
      if (parsed.token !== token) {
        return { success: false, error: 'Invalid reset token verification.' };
      }

      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(RESET_TOKEN_KEY);
        return { success: false, error: 'Reset link has expired. Please request a new link.' };
      }

      // Save new password
      localStorage.setItem(ADMIN_PASS_KEY, newPass);
      localStorage.removeItem(RESET_TOKEN_KEY);

      await ottApi.logAudit('Password Reset Successfully Changed', 'Admin Security', parsed.email);
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update password.' };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdminAuthenticated: !!adminUser,
        isLoading,
        login,
        logout,
        requestPasswordReset,
        resetPassword,
        changePassword
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
