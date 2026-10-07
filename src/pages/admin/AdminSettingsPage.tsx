import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Check, ShieldCheck, Mail, Phone, 
  MessageSquare, CreditCard, Bell, Key, RefreshCw, AlertCircle, Sparkles, Lock 
} from 'lucide-react';
import { ottApi, ADMIN_CONFIG } from '../../services/api';
import { AdminSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Settings State
  const [siteName, setSiteName] = useState('OTT SELLERS');
  const [supportEmail, setSupportEmail] = useState(ADMIN_CONFIG.EMAIL);
  const [supportPhone, setSupportPhone] = useState('+91 9441323332');
  const [supportWhatsApp, setSupportWhatsApp] = useState('9441323332');
  const [announcementText, setAnnouncementText] = useState('🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Instant WhatsApp Credentials Delivery.');
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_placeholder');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpUser, setSmtpUser] = useState(ADMIN_CONFIG.EMAIL);
  const [randomNotifs, setRandomNotifs] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await ottApi.getAdminSettings();
      setSiteName(s.siteName || 'OTT SELLERS');
      setSupportEmail(s.supportEmail || ADMIN_CONFIG.EMAIL);
      setSupportPhone(s.supportPhone || '+91 9441323332');
      setSupportWhatsApp(s.supportWhatsApp || '9441323332');
      setAnnouncementText(s.announcementText || '');
      setRazorpayKeyId(s.razorpayKeyId || 'rzp_test_placeholder');
      setSmtpHost(s.smtpHost || 'smtp.gmail.com');
      setSmtpUser(s.smtpUser || ADMIN_CONFIG.EMAIL);
      setRandomNotifs(s.randomNotificationsActive ?? true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg(null);

    const updated: AdminSettings = {
      id: 'global',
      siteName: siteName.trim(),
      supportEmail: supportEmail.trim() || ADMIN_CONFIG.EMAIL,
      supportPhone: supportPhone.trim(),
      supportWhatsApp: supportWhatsApp.trim(),
      announcementText: announcementText.trim(),
      razorpayKeyId: razorpayKeyId.trim(),
      smtpHost: smtpHost.trim(),
      smtpUser: supportEmail.trim() || ADMIN_CONFIG.EMAIL,
      randomNotificationsActive: randomNotifs,
      updatedAt: Date.now()
    };

    await ottApi.saveAdminSettings(updated);
    await ottApi.logAudit('UPDATE_SETTINGS', 'admin_settings', 'global', { siteName, supportEmail: updated.supportEmail });

    setSaving(false);
    setSaveSuccessMsg('Store settings saved successfully to Supabase! Live storefront updated.');
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Settings className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Store & Website Settings</span>
          </h1>
          <p className="admin-sub-text">
            Configure official admin profile ({ADMIN_CONFIG.EMAIL}), customer WhatsApp sales number, and site announcements.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Reload from Supabase"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '860px' }}>
        {/* 1. Admin Profile & Email */}
        <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, paddingBottom: '10px', borderBottom: '1px solid #1e293b' }}>
            <ShieldCheck size={18} style={{ color: '#38bdf8' }} />
            <span>Administrator Profile & Email Settings</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Configured Administrator Email *
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#38bdf8', fontSize: '0.86rem', fontWeight: 700, outline: 'none' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Official email used for admin login & forgot-password recovery.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Store Brand Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#ffffff', fontSize: '0.86rem', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* 2. WhatsApp Sales & Helpline */}
        <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, paddingBottom: '10px', borderBottom: '1px solid #1e293b' }}>
            <MessageSquare size={18} style={{ color: '#34d399' }} />
            <span>Customer Sales WhatsApp & Helpline</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Customer Sales WhatsApp Number *
              </label>
              <input
                type="text"
                required
                value={supportWhatsApp}
                onChange={(e) => setSupportWhatsApp(e.target.value)}
                style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#34d399', fontSize: '0.86rem', fontWeight: 700, fontFamily: 'monospace', outline: 'none' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Used for instant credentials delivery & live floating button.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Customer Support Calling Line
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#ffffff', fontSize: '0.86rem', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Announcement Banner */}
        <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, paddingBottom: '10px', borderBottom: '1px solid #1e293b' }}>
            <Bell size={18} style={{ color: '#f59e0b' }} />
            <span>Storefront Top Announcement Banner</span>
          </h2>

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              Top Announcement Text
            </label>
            <textarea
              rows={2}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#ffffff', fontSize: '0.84rem', outline: 'none', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving Settings...' : 'Save Settings to Supabase'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
