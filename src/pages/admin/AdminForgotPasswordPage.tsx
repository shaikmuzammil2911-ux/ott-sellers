import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ADMIN_CONFIG } from '../../services/api';
import './AdminAuth.css';

export const AdminForgotPasswordPage: React.FC = () => {
  const { requestPasswordReset } = useAdminAuth();

  const [email, setEmail] = useState(ADMIN_CONFIG.EMAIL);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your authorized admin email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await requestPasswordReset(email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || `Password reset instructions sent to ${email}. Please check your inbox.`);
    } else {
      setErrorMsg(res.error || 'Failed to dispatch password reset request.');
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <div className="admin-auth-icon-badge recovery">
            <Mail size={28} />
          </div>
          <span className="admin-super-tag">ACCOUNT RECOVERY</span>
          <h1 className="admin-auth-title">Reset Admin Password</h1>
          <p className="admin-auth-subtitle">
            Enter your admin email to receive a secure token link via Gmail SMTP.
          </p>
        </div>

        {errorMsg && (
          <div className="admin-auth-alert error" role="alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="admin-auth-success-box">
            <CheckCircle2 size={44} color="#10b981" />
            <h3>Reset Email Dispatched!</h3>
            <p>{successMsg}</p>
            <p className="hint-text">
              Check the inbox and spam folder of <strong>{email}</strong> and click the link to reset your password.
            </p>
            <Link to="/admin/login" className="btn-admin-submit" style={{ marginTop: '20px', textDecoration: 'none' }}>
              Return to Admin Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-auth-form">
            <div className="admin-field-group">
              <label htmlFor="recovery-email">Registered Admin Email</label>
              <div className="admin-input-wrap">
                <Mail size={18} className="field-icon" />
                <input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ADMIN_CONFIG.EMAIL}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-admin-submit"
            >
              {isLoading ? (
                <span>Dispatching SMTP Email...</span>
              ) : (
                <>
                  <span>Send Password Reset Link</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="admin-auth-footer">
          <Link to="/admin/login" className="return-store-link">
            <ArrowLeft size={16} />
            <span>Back to Admin Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
