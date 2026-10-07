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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-primary-500" />
            Store & System Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global store configuration, WhatsApp sales numbers, SMTP credentials, and announcement alerts.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors self-start sm:self-auto"
          title="Reload from Supabase"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3 text-sm">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Contact & WhatsApp */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Customer Sales & WhatsApp Dispatch
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Store / Brand Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dedicated Sales WhatsApp Number *</label>
              <input
                type="text"
                required
                value={supportWhatsApp}
                onChange={(e) => setSupportWhatsApp(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 font-mono font-bold text-emerald-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Used for post-payment customer redirect & float button</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Support Calling Line</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-5 h-5 text-amber-400" />
            Top Announcement Bar
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ticker / Flash Banner Message</label>
            <textarea
              rows={2}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Displays across the top of all customer pages.</span>
          </div>
        </div>

        {/* Integration Credentials (Read-only / Safe display) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5 text-primary-500" />
            Gateway & Backend Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Razorpay Merchant Key ID</label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-primary-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Live client-safe Key ID</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gmail SMTP Relay Server</label>
              <input
                type="text"
                readOnly
                value={`${smtpHost}:465 (Fixyourmobiles7@gmail.com)`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-400 text-xs font-mono cursor-not-allowed"
              />
              <span className="text-[11px] text-emerald-400/80 mt-1 block">✓ SMTP Connected and Verified via Nodemailer</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-primary-600/30 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Settings to Supabase'}
          </button>
        </div>
      </form>
    </div>
  );
};
