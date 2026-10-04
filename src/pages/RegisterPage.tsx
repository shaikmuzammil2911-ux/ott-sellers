import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !mobileNumber || !email || !password || !confirmPassword) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await register(fullName, mobileNumber, email, password);
      setIsLoading(false);
      navigate('/account');
    } catch {
      setIsLoading(false);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card register-mode">
          <div className="auth-header">
            <img src="/logo.png" alt="OTT Sellers" className="auth-brand-logo" />
            <h1 className="auth-title">Create New Account</h1>
            <p className="auth-sub">Join 50,000+ happy streamers and manage all your subscriptions in one place.</p>
          </div>

          {error && (
            <div className="auth-error-box">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number (WhatsApp) *</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="+91 98765 43210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-row-two-col">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-auth-submit">
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-prompt">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-action-link">
                Sign In <ArrowRight size={14} />
              </Link>
            </p>
          </div>

          <div className="auth-trust-note">
            <ShieldCheck size={16} />
            <span>Instant access • No spam guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};
