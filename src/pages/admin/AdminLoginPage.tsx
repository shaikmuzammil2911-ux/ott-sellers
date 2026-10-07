import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ADMIN_CONFIG } from '../../services/api';
import './AdminAuth.css';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(ADMIN_CONFIG.EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <div className="admin-auth-icon-badge">
            <Lock size={28} />
          </div>
          <span className="admin-super-tag">ADMINISTRATOR PORTAL</span>
          <h1 className="admin-auth-title">OTT SELLERS CMS</h1>
          <p className="admin-auth-subtitle">
            Secure administrative control panel & live Supabase database management.
          </p>
        </div>

        {errorMsg && (
          <div className="admin-auth-alert error" role="alert">
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="admin-field-group">
            <label htmlFor="admin-email">Admin Email Address</label>
            <div className="admin-input-wrap">
              <Mail size={18} className="field-icon" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ADMIN_CONFIG.EMAIL}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-field-group">
            <div className="label-with-link">
              <label htmlFor="admin-password">Password</label>
              <Link to="/admin/forgot-password" className="forgot-pass-link">
                Forgot Password?
              </Link>
            </div>
            <div className="admin-input-wrap">
              <Lock size={18} className="field-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-admin-submit"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="admin-auth-footer">
          <p className="security-notice">
            <CheckCircle2 size={14} color="#10b981" />
            <span>Protected by Supabase Auth & Row Level Security</span>
          </p>
          <Link to="/" className="return-store-link">
            ← Return to Live Customer Store
          </Link>
        </div>
      </div>
    </div>
  );
};
