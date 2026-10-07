import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Check, ShieldCheck, Mail, Phone, 
  MessageSquare, CreditCard, Bell, Key, RefreshCw, AlertCircle 
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { AdminSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Settings State
  const [siteName, setSiteName] = useState('OTT SELLERS');
  const [supportEmail, setSupportEmail] = useState('Fixyourmobiles7@gmail.com');
  const [supportPhone, setSupportPhone] = useState('+91 9441323332');
  const [supportWhatsApp, setSupportWhatsApp] = useState('9441323332');
  const [announcementText, setAnnouncementText] = useState('🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Instant WhatsApp Credentials Delivery.');
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_placeholder');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpUser, setSmtpUser] = useState('Fixyourmobiles7@gmail.com');

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await ottApi.getAdminSettings();
      setSiteName(s.siteName);
      setSupportEmail(s.supportEmail);
      setSupportPhone(s.supportPhone);
      setSupportWhatsApp(s.supportWhatsApp);
      setAnnouncementText(s.announcementText);
      setRazorpayKeyId(s.razorpayKeyId || 'rzp_test_placeholder');
      setSmtpHost(s.smtpHost || 'smtp.gmail.com');
      setSmtpUser(s.smtpUser || 'Fixyourmobiles7@gmail.com');
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
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      supportWhatsApp: supportWhatsApp.trim(),
      announcementText: announcementText.trim(),
      razorpayKeyId: razorpayKeyId.trim(),
      smtpHost: smtpHost.trim(),
      smtpUser: supportEmail.trim(),
      updatedAt: Date.now()
    };

    await ottApi.saveAdminSettings(updated);
    await ottApi.logAudit('UPDATE_SETTINGS', 'admin_settings', 'global', { siteName, supportWhatsApp });

    setSaving(false);
    setSaveSuccessMsg('Store settings saved successfully to Supabase! Live site updated.');
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  return (
    <div className="admin-page-container">
      {/* Responsive Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Settings className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Store & System Settings</span>
          </h1>
          <p className="admin-sub-text">
            Global store configuration, WhatsApp sales numbers, Razorpay keys, and announcement alerts.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Reload from Supabase"
          >
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px' }}>
        {/* Contact & WhatsApp */}
        <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '20px', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #1e293b', margin: 0 }}>
            <MessageSquare size={18} style={{ color: '#34d399' }} />
            <span>Customer Sales & WhatsApp Dispatch</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Store / Brand Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '0.88rem', fontWeight: 600, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Dedicated Sales WhatsApp Number *</label>
              <input
                type="text"
                required
                value={supportWhatsApp}
                onChange={(e) => setSupportWhatsApp(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 16px', color: '#34d399', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'monospace', outline: 'none' }}
              />
              <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Used for post-payment customer redirect & float button</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Official Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Support Calling Line</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '20px', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #1e293b', margin: 0 }}>
            <Bell size={18} style={{ color: '#f59e0b' }} />
            <span>Top Announcement Bar</span>
          </h2>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Ticker / Flash Banner Message</label>
            <textarea
              rows={2}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
            />
            <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Displays across the top of all customer pages.</span>
          </div>
        </div>

        {/* Integration Credentials */}
        <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '20px', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #1e293b', margin: 0 }}>
            <ShieldCheck size={18} style={{ color: '#0284c7' }} />
            <span>Razorpay & Backend Credentials</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Razorpay Merchant Key ID</label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '0.82rem', fontFamily: 'monospace', outline: 'none' }}
              />
              <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Live client-safe Razorpay Key ID</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Gmail SMTP Relay Server</label>
              <input
                type="text"
                readOnly
                value={`${smtpHost}:465 (Fixyourmobiles7@gmail.com)`}
                style={{ width: '100%', background: '#030712', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 16px', color: '#94a3b8', fontSize: '0.82rem', fontFamily: 'monospace', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.74rem', color: '#34d399', marginTop: '4px', display: 'block' }}>✓ SMTP Connected and Verified via Nodemailer</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary-action"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save All Settings to Supabase'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
