import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('muzammil@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide your Email/Mobile and Password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await login(identifier, password);
      setIsLoading(false);
      navigate('/account');
    } catch {
      setIsLoading(false);
      setError('Login credentials could not be verified.');
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/logo.png" alt="OTT Sellers" className="auth-brand-logo" />
            <h1 className="auth-title">Customer Login</h1>
            <p className="auth-sub">Access your subscriptions, order tracking, and account settings.</p>
          </div>

          {error && (
            <div className="auth-error-box">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email or Mobile Number</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="name@example.com or +91..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label className="form-label">Password</label>
                <a href="#forgot" className="forgot-link">Forgot Password?</a>
              </div>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-auth-submit">
              {isLoading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Login to My Account</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-prompt">
            <p>
              Don't have an OTT Sellers account?{' '}
              <Link to="/register" className="auth-action-link">
                Create Account <ArrowRight size={14} />
              </Link>
            </p>
          </div>

          <div className="auth-trust-note">
            <ShieldCheck size={16} />
            <span>Customer portal with encrypted credentials vault</span>
          </div>
        </div>
      </div>
    </div>
  );
};
