import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminAuth.css';

export const AdminResetPasswordPage: React.FC = () => {
  const { resetPassword } = useAdminAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('No valid reset token found in URL.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await resetPassword(token, newPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login', { replace: true });
      }, 2500);
    } else {
      setErrorMsg(res.error || 'Failed to update password.');
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <div className="admin-auth-icon-badge">
            <KeyRound size={28} />
          </div>
          <span className="admin-super-tag">ADMIN CREDENTIALS</span>
          <h1 className="admin-auth-title">Create New Password</h1>
          <p className="admin-auth-subtitle">
            Enter a strong new password for administrator access.
          </p>
        </div>

        {errorMsg && (
          <div className="admin-auth-alert error" role="alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="admin-auth-success-box">
            <CheckCircle2 size={44} color="#10b981" />
            <h3>Password Updated!</h3>
            <p>Your administrator password has been updated successfully.</p>
            <p className="hint-text">Redirecting you to the sign-in screen...</p>
            <Link to="/admin/login" className="btn-admin-submit" style={{ marginTop: '20px', textDecoration: 'none' }}>
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-auth-form">
            <div className="admin-field-group">
              <label htmlFor="new-pass">New Password</label>
              <div className="admin-input-wrap">
                <Lock size={18} className="field-icon" />
                <input
                  id="new-pass"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
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

            <div className="admin-field-group">
              <label htmlFor="confirm-pass">Confirm Password</label>
              <div className="admin-input-wrap">
                <Lock size={18} className="field-icon" />
                <input
                  id="confirm-pass"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-admin-submit"
            >
              {isLoading ? <span>Updating Password...</span> : <span>Save & Activate New Password</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
