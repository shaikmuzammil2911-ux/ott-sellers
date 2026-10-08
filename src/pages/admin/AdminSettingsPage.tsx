import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Check, ShieldCheck, Mail, Phone, 
  MessageSquare, CreditCard, Bell, Key, RefreshCw, AlertCircle, 
  Sparkles, Lock, Link as LinkIcon, Gift, User, Send, CheckCircle2 
} from 'lucide-react';
import { 
  ottApi, ADMIN_CONFIG, DEFAULT_FOOTER_SETTINGS, 
  DEFAULT_WHATSAPP_SETTINGS, DEFAULT_REFERRAL_SETTINGS 
} from '../../services/api';
import { 
  AdminSettings, FooterSettings, WhatsAppSettings, ReferralSettings, FooterQuickLink 
} from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'whatsapp' | 'footer' | 'referral' | 'security'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // General Settings State
  const [siteName, setSiteName] = useState('OTT SELLERS');
  const [supportEmail, setSupportEmail] = useState(ADMIN_CONFIG.EMAIL);
  const [supportPhone, setSupportPhone] = useState('+91 9441323332');
  const [announcementText, setAnnouncementText] = useState('🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Instant WhatsApp Credentials Delivery.');
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_placeholder');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpUser, setSmtpUser] = useState(ADMIN_CONFIG.EMAIL);
  const [randomNotifs, setRandomNotifs] = useState(true);

  // WhatsApp CMS State
  const [whatsappNumber, setWhatsappNumber] = useState('9441323332');
  const [whatsappButtonText, setWhatsappButtonText] = useState('Chat with Us');
  const [whatsappActive, setWhatsappActive] = useState(true);
  const [whatsappPosition, setWhatsappPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [whatsappTagMessage, setWhatsappTagMessage] = useState('Need instant help or quick subscription activation? Chat with us live on WhatsApp!');
  const [whatsappOrderTemplate, setWhatsappOrderTemplate] = useState(DEFAULT_WHATSAPP_SETTINGS.orderMessageTemplate);

  // Footer CMS State
  const [footerDesc, setFooterDesc] = useState(DEFAULT_FOOTER_SETTINGS.description);
  const [footerTagline, setFooterTagline] = useState(DEFAULT_FOOTER_SETTINGS.tagline);
  const [footerCopyright, setFooterCopyright] = useState(DEFAULT_FOOTER_SETTINGS.copyrightText);
  const [footerInstagram, setFooterInstagram] = useState(DEFAULT_FOOTER_SETTINGS.socialInstagram || '');
  const [footerYoutube, setFooterYoutube] = useState(DEFAULT_FOOTER_SETTINGS.socialYoutube || '');
  const [footerTelegram, setFooterTelegram] = useState(DEFAULT_FOOTER_SETTINGS.socialTelegram || '');

  // Refer & Earn CMS State
  const [referralEnabled, setReferralEnabled] = useState(true);
  const [referralRewardAmount, setReferralRewardAmount] = useState('50');
  const [referralShareMessage, setReferralShareMessage] = useState(DEFAULT_REFERRAL_SETTINGS.shareMessage);

  // Security & OTP State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [isPasswordOtpSent, setIsPasswordOtpSent] = useState(false);
  const [passwordOtpStatus, setPasswordOtpStatus] = useState<string | null>(null);

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [emailOtpStatus, setEmailOtpStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, footer, ws, ref] = await Promise.all([
        ottApi.getAdminSettings(),
        ottApi.getFooterSettings(),
        ottApi.getWhatsAppSettings(),
        ottApi.getReferralSettings()
      ]);

      setSiteName(s.siteName || 'OTT SELLERS');
      setSupportEmail(s.supportEmail || ADMIN_CONFIG.EMAIL);
      setSupportPhone(s.supportPhone || '+91 9441323332');
      setAnnouncementText(s.announcementText || '');
      setRazorpayKeyId(s.razorpayKeyId || 'rzp_test_placeholder');
      setSmtpHost(s.smtpHost || 'smtp.gmail.com');
      setSmtpUser(s.smtpUser || ADMIN_CONFIG.EMAIL);
      setRandomNotifs(s.randomNotificationsActive ?? true);

      // WhatsApp
      setWhatsappNumber(ws.number || s.supportWhatsApp || '9441323332');
      setWhatsappButtonText(ws.buttonText || 'Chat with Us');
      setWhatsappActive(ws.isActive ?? true);
      setWhatsappPosition(ws.position || 'bottom-right');
      setWhatsappTagMessage(ws.tagMessage || DEFAULT_WHATSAPP_SETTINGS.tagMessage);
      setWhatsappOrderTemplate(ws.orderMessageTemplate || DEFAULT_WHATSAPP_SETTINGS.orderMessageTemplate);

      // Footer
      setFooterDesc(footer.description || DEFAULT_FOOTER_SETTINGS.description);
      setFooterTagline(footer.tagline || DEFAULT_FOOTER_SETTINGS.tagline);
      setFooterCopyright(footer.copyrightText || DEFAULT_FOOTER_SETTINGS.copyrightText);
      setFooterInstagram(footer.socialInstagram || '');
      setFooterYoutube(footer.socialYoutube || '');
      setFooterTelegram(footer.socialTelegram || '');

      // Referral
      setReferralEnabled(ref.isEnabled ?? true);
      setReferralRewardAmount(String(ref.rewardAmount || 50));
      setReferralShareMessage(ref.shareMessage || DEFAULT_REFERRAL_SETTINGS.shareMessage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setSaveErrorMsg(null);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  const showError = (msg: string) => {
    setSaveErrorMsg(msg);
    setSaveSuccessMsg(null);
    setTimeout(() => setSaveErrorMsg(null), 6000);
  };

  const handleSaveGeneralAndWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedAdminSettings: AdminSettings = {
        id: 'global',
        siteName: siteName.trim(),
        supportEmail: supportEmail.trim() || ADMIN_CONFIG.EMAIL,
        supportPhone: supportPhone.trim(),
        supportWhatsApp: whatsappNumber.trim(),
        announcementText: announcementText.trim(),
        razorpayKeyId: razorpayKeyId.trim(),
        smtpHost: smtpHost.trim(),
        smtpUser: supportEmail.trim() || ADMIN_CONFIG.EMAIL,
        randomNotificationsActive: randomNotifs,
        updatedAt: Date.now()
      };

      const updatedWhatsApp: WhatsAppSettings = {
        number: whatsappNumber.trim(),
        buttonText: whatsappButtonText.trim(),
        isActive: whatsappActive,
        position: whatsappPosition,
        displayPages: 'all',
        tagMessage: whatsappTagMessage.trim(),
        orderMessageTemplate: whatsappOrderTemplate.trim(),
        updatedAt: Date.now()
      };

      await Promise.all([
        ottApi.saveAdminSettings(updatedAdminSettings),
        ottApi.saveWhatsAppSettings(updatedWhatsApp)
      ]);

      await ottApi.logAudit('UPDATE_SETTINGS', 'admin_settings', 'global', { siteName, whatsapp: whatsappNumber });
      showToast('Store settings & WhatsApp CMS saved successfully! Live storefront updated.');
    } catch (err: any) {
      showError(err?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const currentFooter = await ottApi.getFooterSettings();
      const updatedFooter: FooterSettings = {
        ...currentFooter,
        description: footerDesc.trim(),
        tagline: footerTagline.trim(),
        copyrightText: footerCopyright.trim(),
        contactEmail: supportEmail.trim(),
        contactPhone: supportPhone.trim(),
        whatsappNumber: whatsappNumber.trim(),
        socialInstagram: footerInstagram.trim(),
        socialYoutube: footerYoutube.trim(),
        socialTelegram: footerTelegram.trim(),
        updatedAt: Date.now()
      };

      await ottApi.saveFooterSettings(updatedFooter);
      await ottApi.logAudit('UPDATE_FOOTER_CMS', 'footer', 'global', { updated: true });
      showToast('Footer content saved and synced with live store!');
    } catch (err: any) {
      showError(err?.message || 'Failed to update footer.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedRef: ReferralSettings = {
        isEnabled: referralEnabled,
        rewardAmount: Number(referralRewardAmount) || 50,
        rewardUnit: 'INR',
        referralCodePrefix: 'REF',
        shareMessage: referralShareMessage.trim(),
        rules: DEFAULT_REFERRAL_SETTINGS.rules,
        updatedAt: Date.now()
      };

      await ottApi.saveReferralSettings(updatedRef);
      await ottApi.logAudit('UPDATE_REFERRAL_CMS', 'referral', 'global', { isEnabled: referralEnabled });
      showToast('Refer & Earn settings updated successfully!');
    } catch (err: any) {
      showError(err?.message || 'Failed to save referral settings.');
    } finally {
      setSaving(false);
    }
  };

  // OTP Password Handlers
  const handleRequestPasswordOtp = async () => {
    if (!newPassword || newPassword.length < 6) {
      showError('Please enter a new password of at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    const res = await ottApi.requestAdminOTP('change_password', ADMIN_CONFIG.EMAIL);
    setIsPasswordOtpSent(true);
    setPasswordOtpStatus(res.message);
    showToast(`Verification code sent to ${ADMIN_CONFIG.EMAIL}`);
  };

  const handleVerifyChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordOtp.trim()) {
      showError('Please enter the 6-digit OTP received on your email.');
      return;
    }

    const res = await ottApi.changeAdminPassword(newPassword, passwordOtp.trim());
    if (res.success) {
      showToast(res.message || 'Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOtp('');
      setIsPasswordOtpSent(false);
      setPasswordOtpStatus(null);
    } else {
      showError(res.error || 'Failed to verify OTP.');
    }
  };

  // OTP Email Handlers
  const handleRequestEmailOtp = async () => {
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      showError('Please enter a valid new admin email.');
      return;
    }

    const res = await ottApi.requestAdminOTP('change_email', newAdminEmail.trim());
    setIsEmailOtpSent(true);
    setEmailOtpStatus(res.message);
    showToast(`Verification code sent to ${newAdminEmail}`);
  };

  const handleVerifyChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp.trim()) {
      showError('Please enter the verification code.');
      return;
    }

    const res = await ottApi.changeAdminEmail(newAdminEmail.trim(), emailOtp.trim());
    if (res.success) {
      showToast(res.message || 'Email updated successfully!');
      setSupportEmail(newAdminEmail.trim());
      setNewAdminEmail('');
      setEmailOtp('');
      setIsEmailOtpSent(false);
      setEmailOtpStatus(null);
    } else {
      showError(res.error || 'Failed to update email.');
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Settings className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Store & CMS Settings</span>
          </h1>
          <p className="admin-sub-text">
            Configure store metadata, customer WhatsApp routing & templates, footer links, referral rewards, and admin security.
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
          <CheckCircle2 size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="admin-alert-banner error">
          <AlertCircle size={16} />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Tabs Switcher Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--admin-border)', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          style={{
            padding: '10px 16px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeTab === 'general' ? '#ffffff' : 'transparent',
            borderBottom: activeTab === 'general' ? '2px solid var(--admin-primary)' : '2px solid transparent',
            color: activeTab === 'general' ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Settings size={15} />
          <span>General Store</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          style={{
            padding: '10px 16px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeTab === 'whatsapp' ? '#ffffff' : 'transparent',
            borderBottom: activeTab === 'whatsapp' ? '2px solid var(--admin-primary)' : '2px solid transparent',
            color: activeTab === 'whatsapp' ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <MessageSquare size={15} />
          <span>WhatsApp CMS & Template</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('footer')}
          style={{
            padding: '10px 16px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeTab === 'footer' ? '#ffffff' : 'transparent',
            borderBottom: activeTab === 'footer' ? '2px solid var(--admin-primary)' : '2px solid transparent',
            color: activeTab === 'footer' ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <LinkIcon size={15} />
          <span>Footer CMS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('referral')}
          style={{
            padding: '10px 16px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeTab === 'referral' ? '#ffffff' : 'transparent',
            borderBottom: activeTab === 'referral' ? '2px solid var(--admin-primary)' : '2px solid transparent',
            color: activeTab === 'referral' ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Gift size={15} />
          <span>Refer & Earn</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          style={{
            padding: '10px 16px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeTab === 'security' ? '#ffffff' : 'transparent',
            borderBottom: activeTab === 'security' ? '2px solid var(--admin-primary)' : '2px solid transparent',
            color: activeTab === 'security' ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldCheck size={15} />
          <span>Admin Profile & OTP Security</span>
        </button>
      </div>

      {/* TAB 1: General Store Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneralAndWhatsApp} className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">General Website Details</h2>
          </div>

          <div className="admin-form-row-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Brand & Store Name</label>
              <input
                type="text"
                className="admin-form-input"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Official Support Email</label>
              <input
                type="email"
                className="admin-form-input"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-form-row-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Customer Support Phone</label>
              <input
                type="text"
                className="admin-form-input"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Razorpay Public Key ID</label>
              <input
                type="text"
                className="admin-form-input"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder="rzp_live_xxx or rzp_test_xxx"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Homepage Top Announcement Strip</label>
            <textarea
              className="admin-form-textarea"
              rows={2}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={randomNotifs}
                onChange={(e) => setRandomNotifs(e.target.checked)}
              />
              <span>Enable live random purchase toast notifications on storefront</span>
            </label>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn-primary-action">
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save General Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: WhatsApp CMS & Dynamic Order Message */}
      {activeTab === 'whatsapp' && (
        <form onSubmit={handleSaveGeneralAndWhatsApp} className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">WhatsApp Order & Floating Tag Settings</h2>
          </div>

          <div className="admin-form-row-2">
            <div className="admin-form-group">
              <label className="admin-form-label">WhatsApp Receiving Number (No '+' or spaces) *</label>
              <input
                type="text"
                className="admin-form-input"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 919441323332"
                required
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                This is the authoritative number where customer carts, orders, and support messages are routed.
              </span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Floating Button Text</label>
              <input
                type="text"
                className="admin-form-input"
                value={whatsappButtonText}
                onChange={(e) => setWhatsappButtonText(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Floating Tag Status</label>
              <select
                className="admin-form-select"
                value={whatsappActive ? 'on' : 'off'}
                onChange={(e) => setWhatsappActive(e.target.value === 'on')}
              >
                <option value="on">Active (Display on website)</option>
                <option value="off">Inactive (Hide)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Screen Position</label>
              <select
                className="admin-form-select"
                value={whatsappPosition}
                onChange={(e) => setWhatsappPosition(e.target.value as any)}
              >
                <option value="bottom-right">Bottom Right (Recommended)</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Hover Tooltip Message</label>
            <input
              type="text"
              className="admin-form-input"
              value={whatsappTagMessage}
              onChange={(e) => setWhatsappTagMessage(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Dynamic Order WhatsApp Message Template</label>
            <textarea
              className="admin-form-textarea"
              rows={8}
              style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
              value={whatsappOrderTemplate}
              onChange={(e) => setWhatsappOrderTemplate(e.target.value)}
            />
            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span>Available tags:</span>
              <code>{'{{order_id}}'}</code>
              <code>{'{{customer_name}}'}</code>
              <code>{'{{customer_phone}}'}</code>
              <code>{'{{items}}'}</code>
              <code>{'{{subtotal}}'}</code>
              <code>{'{{coupon_code}}'}</code>
              <code>{'{{discount}}'}</code>
              <code>{'{{final_amount}}'}</code>
              <code>{'{{payment_status}}'}</code>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn-primary-action">
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save WhatsApp CMS'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Footer CMS */}
      {activeTab === 'footer' && (
        <form onSubmit={handleSaveFooter} className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Footer Management CMS</h2>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Footer Brand Description</label>
            <textarea
              className="admin-form-textarea"
              rows={3}
              value={footerDesc}
              onChange={(e) => setFooterDesc(e.target.value)}
            />
          </div>

          <div className="admin-form-row-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Footer Tagline</label>
              <input
                type="text"
                className="admin-form-input"
                value={footerTagline}
                onChange={(e) => setFooterTagline(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Copyright Notice</label>
              <input
                type="text"
                className="admin-form-input"
                value={footerCopyright}
                onChange={(e) => setFooterCopyright(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row-3">
            <div className="admin-form-group">
              <label className="admin-form-label">Instagram Link</label>
              <input
                type="url"
                className="admin-form-input"
                value={footerInstagram}
                onChange={(e) => setFooterInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">YouTube Link</label>
              <input
                type="url"
                className="admin-form-input"
                value={footerYoutube}
                onChange={(e) => setFooterYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Telegram Link</label>
              <input
                type="url"
                className="admin-form-input"
                value={footerTelegram}
                onChange={(e) => setFooterTelegram(e.target.value)}
                placeholder="https://t.me/..."
              />
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn-primary-action">
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Footer Content'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Refer & Earn CMS */}
      {activeTab === 'referral' && (
        <form onSubmit={handleSaveReferral} className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Refer & Earn Program Configuration</h2>
          </div>

          <div className="admin-form-row-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Program Status</label>
              <select
                className="admin-form-select"
                value={referralEnabled ? 'enabled' : 'disabled'}
                onChange={(e) => setReferralEnabled(e.target.value === 'enabled')}
              >
                <option value="enabled">Enabled (Visible to Customers)</option>
                <option value="disabled">Disabled (Hidden)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Reward Amount per Verified Referral (₹)</label>
              <input
                type="number"
                min="0"
                className="admin-form-input"
                value={referralRewardAmount}
                onChange={(e) => setReferralRewardAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Customer Share Message Template</label>
            <textarea
              className="admin-form-textarea"
              rows={3}
              value={referralShareMessage}
              onChange={(e) => setReferralShareMessage(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn-primary-action">
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Refer & Earn Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: Admin Security & OTP Verification */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Change Password Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="#0284c7" />
                <span>Change Admin Password (with OTP Verification)</span>
              </h2>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginBottom: '16px' }}>
              To protect the administrative portal, password updates require verification by sending an OTP to the verified Admin email (<strong>{ADMIN_CONFIG.EMAIL}</strong>).
            </p>

            <form onSubmit={handleVerifyChangePassword}>
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">New Password (min 6 chars) *</label>
                  <input
                    type="password"
                    className="admin-form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Confirm New Password *</label>
                  <input
                    type="password"
                    className="admin-form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>

              {!isPasswordOtpSent ? (
                <button
                  type="button"
                  onClick={handleRequestPasswordOtp}
                  className="btn-primary-action"
                  style={{ marginTop: '10px' }}
                >
                  <Send size={15} />
                  <span>Send Verification Code to {ADMIN_CONFIG.EMAIL}</span>
                </button>
              ) : (
                <div>
                  {passwordOtpStatus && (
                    <div className="admin-alert-banner" style={{ margin: '14px 0' }}>
                      <Check size={16} />
                      <span>{passwordOtpStatus}</span>
                    </div>
                  )}

                  <div className="admin-form-group" style={{ maxWidth: '300px', marginTop: '12px' }}>
                    <label className="admin-form-label">Enter 6-Digit OTP Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      className="admin-form-input"
                      placeholder="e.g. 849201"
                      value={passwordOtp}
                      onChange={(e) => setPasswordOtp(e.target.value.trim())}
                      style={{ letterSpacing: '0.2em', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800 }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                    <button type="submit" className="btn-primary-action">
                      <Check size={16} />
                      <span>Verify OTP & Update Password</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestPasswordOtp}
                      className="btn-refresh-action"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Change Email Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="#0284c7" />
                <span>Change Admin Email Address</span>
              </h2>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginBottom: '16px' }}>
              Current Admin Email: <strong>{supportEmail}</strong>. Updating this email sends a verification code to ensure validity.
            </p>

            <form onSubmit={handleVerifyChangeEmail}>
              <div className="admin-form-group" style={{ maxWidth: '450px' }}>
                <label className="admin-form-label">New Admin Email Address *</label>
                <input
                  type="email"
                  className="admin-form-input"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="e.g. NewAdmin@gmail.com"
                  required
                />
              </div>

              {!isEmailOtpSent ? (
                <button
                  type="button"
                  onClick={handleRequestEmailOtp}
                  className="btn-primary-action"
                  style={{ marginTop: '10px' }}
                >
                  <Send size={15} />
                  <span>Send Verification Code to New Email</span>
                </button>
              ) : (
                <div>
                  {emailOtpStatus && (
                    <div className="admin-alert-banner" style={{ margin: '14px 0' }}>
                      <Check size={16} />
                      <span>{emailOtpStatus}</span>
                    </div>
                  )}

                  <div className="admin-form-group" style={{ maxWidth: '300px', marginTop: '12px' }}>
                    <label className="admin-form-label">Enter 6-Digit OTP Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      className="admin-form-input"
                      placeholder="e.g. 518392"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.trim())}
                      style={{ letterSpacing: '0.2em', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800 }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                    <button type="submit" className="btn-primary-action">
                      <Check size={16} />
                      <span>Verify Code & Change Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestEmailOtp}
                      className="btn-refresh-action"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
