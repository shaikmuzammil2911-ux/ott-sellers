import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Check, ShieldCheck, Mail, Phone, 
  MessageSquare, CreditCard, Bell, Key, RefreshCw, AlertCircle, 
  Sparkles, Lock, Link as LinkIcon, Gift, User, Send, CheckCircle2, Upload, Plus, Trash2, Edit2, Eye, EyeOff, Image as ImageIcon
} from 'lucide-react';
import { 
  ottApi, ADMIN_CONFIG, DEFAULT_FOOTER_SETTINGS, 
  DEFAULT_WHATSAPP_SETTINGS, DEFAULT_REFERRAL_SETTINGS, DEFAULT_ITEMS_PAGE_CMS, getCleanImageUrl 
} from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  AdminSettings, FooterSettings, WhatsAppSettings, ReferralSettings, FooterQuickLink, ItemsPageCMS 
} from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { changePassword } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'whatsapp' | 'footer' | 'items_cms' | 'security'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // General & Branding State
  const [siteName, setSiteName] = useState('OTT SELLERS');
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [supportEmail, setSupportEmail] = useState(ADMIN_CONFIG.EMAIL);
  const [supportPhone, setSupportPhone] = useState('+91 9441323332');
  const [announcementText, setAnnouncementText] = useState('🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Instant WhatsApp Credentials Delivery.');
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_placeholder');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpUser, setSmtpUser] = useState(ADMIN_CONFIG.EMAIL);
  const [randomNotifs, setRandomNotifs] = useState(true);

  // Items Page Headings CMS
  const [itemsMainHeading, setItemsMainHeading] = useState(DEFAULT_ITEMS_PAGE_CMS.mainHeading);
  const [itemsMainSubtitle, setItemsMainSubtitle] = useState(DEFAULT_ITEMS_PAGE_CMS.mainSubtitle);
  const [itemsQuickSearchHeading, setItemsQuickSearchHeading] = useState(DEFAULT_ITEMS_PAGE_CMS.quickSearchHeading);
  const [itemsCategoriesHeading, setItemsCategoriesHeading] = useState(DEFAULT_ITEMS_PAGE_CMS.categoriesHeading);
  const [itemsListingHeading, setItemsListingHeading] = useState(DEFAULT_ITEMS_PAGE_CMS.itemsListingHeading);

  // Logo Uploading
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // WhatsApp CMS State (Module 9.1 & 9.2)
  const [whatsappNumber, setWhatsappNumber] = useState('9441323332');
  const [whatsappButtonText, setWhatsappButtonText] = useState('Chat with Us');
  const [whatsappActive, setWhatsappActive] = useState(true);
  const [whatsappPosition, setWhatsappPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [whatsappTagMessage, setWhatsappTagMessage] = useState('Need instant help or quick subscription activation? Chat with us live on WhatsApp!');
  
  // WhatsApp Editable Templates
  const [whatsappGeneralMsg, setWhatsappGeneralMsg] = useState('Hello OTT Sellers! I have an inquiry regarding subscription services.');
  const [whatsappCustomerEnquiry, setWhatsappCustomerEnquiry] = useState('Hi OTT Sellers, I would like to know more about {productName}. Can you please assist?');
  const [whatsappItemEnquiry, setWhatsappItemEnquiry] = useState('Hi OTT Sellers! Is {productName} ({duration}) available for instant activation at ₹{price}?');
  const [whatsappOrderTemplate, setWhatsappOrderTemplate] = useState(DEFAULT_WHATSAPP_SETTINGS.orderMessageTemplate);
  const [whatsappContactMessage, setWhatsappContactMessage] = useState('Hi OTT Sellers Team, I am reaching out from your website contact page.');

  // Footer CMS State
  const [footerDesc, setFooterDesc] = useState(DEFAULT_FOOTER_SETTINGS.description);
  const [footerTagline, setFooterTagline] = useState(DEFAULT_FOOTER_SETTINGS.tagline);
  const [footerCopyright, setFooterCopyright] = useState(DEFAULT_FOOTER_SETTINGS.copyrightText);
  const [footerInstagram, setFooterInstagram] = useState(DEFAULT_FOOTER_SETTINGS.socialInstagram || '');
  const [footerYoutube, setFooterYoutube] = useState(DEFAULT_FOOTER_SETTINGS.socialYoutube || '');
  const [footerTelegram, setFooterTelegram] = useState(DEFAULT_FOOTER_SETTINGS.socialTelegram || '');
  
  // Footer Links List Management
  const [quickLinks, setQuickLinks] = useState<FooterQuickLink[]>(DEFAULT_FOOTER_SETTINGS.quickLinks);
  const [customerSupportLinks, setCustomerSupportLinks] = useState<FooterQuickLink[]>(DEFAULT_FOOTER_SETTINGS.customerSupportLinks);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkGroup, setNewLinkGroup] = useState<'quick' | 'support'>('quick');

  // Security State (Module 10: 3 Password Fields)
  const [existingPassword, setExistingPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showExistingPass, setShowExistingPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, footer, ws, itemsCms] = await Promise.all([
        ottApi.getAdminSettings(),
        ottApi.getFooterSettings(),
        ottApi.getWhatsAppSettings(),
        ottApi.getItemsPageCMS()
      ]);

      setSiteName(s.siteName || 'OTT SELLERS');
      setLogoUrl(s.logoUrl || '/logo.png');
      setSupportEmail(s.supportEmail || ADMIN_CONFIG.EMAIL);
      setSupportPhone(s.supportPhone || '+91 9441323332');
      setAnnouncementText(s.announcementText || '');
      setRazorpayKeyId(s.razorpayKeyId || 'rzp_test_placeholder');
      setSmtpHost(s.smtpHost || 'smtp.gmail.com');
      setSmtpUser(s.smtpUser || ADMIN_CONFIG.EMAIL);
      setRandomNotifs(s.randomNotificationsActive ?? true);

      // Items Page CMS
      if (itemsCms) {
        setItemsMainHeading(itemsCms.mainHeading || DEFAULT_ITEMS_PAGE_CMS.mainHeading);
        setItemsMainSubtitle(itemsCms.mainSubtitle || DEFAULT_ITEMS_PAGE_CMS.mainSubtitle);
        setItemsQuickSearchHeading(itemsCms.quickSearchHeading || DEFAULT_ITEMS_PAGE_CMS.quickSearchHeading);
        setItemsCategoriesHeading(itemsCms.categoriesHeading || DEFAULT_ITEMS_PAGE_CMS.categoriesHeading);
        setItemsListingHeading(itemsCms.itemsListingHeading || DEFAULT_ITEMS_PAGE_CMS.itemsListingHeading);
      }

      // WhatsApp
      setWhatsappNumber(ws.number || s.supportWhatsApp || '9441323332');
      setWhatsappButtonText(ws.buttonText || 'Chat with Us');
      setWhatsappActive(ws.isActive ?? true);
      setWhatsappPosition(ws.position || 'bottom-right');
      setWhatsappTagMessage(ws.tagMessage || DEFAULT_WHATSAPP_SETTINGS.tagMessage);
      setWhatsappGeneralMsg(ws.generalMessage || 'Hello OTT Sellers! I have an inquiry regarding subscription services.');
      setWhatsappCustomerEnquiry(ws.customerEnquiryTemplate || 'Hi OTT Sellers, I would like to know more about {productName}. Can you please assist?');
      setWhatsappItemEnquiry(ws.itemEnquiryTemplate || 'Hi OTT Sellers! Is {productName} ({duration}) available for instant activation at ₹{price}?');
      setWhatsappOrderTemplate(ws.orderMessageTemplate || DEFAULT_WHATSAPP_SETTINGS.orderMessageTemplate);
      setWhatsappContactMessage(ws.contactMessageTemplate || 'Hi OTT Sellers Team, I am reaching out from your website contact page.');

      // Footer
      setFooterDesc(footer.description || DEFAULT_FOOTER_SETTINGS.description);
      setFooterTagline(footer.tagline || DEFAULT_FOOTER_SETTINGS.tagline);
      setFooterCopyright(footer.copyrightText || DEFAULT_FOOTER_SETTINGS.copyrightText);
      setFooterInstagram(footer.socialInstagram || '');
      setFooterYoutube(footer.socialYoutube || '');
      setFooterTelegram(footer.socialTelegram || '');
      setQuickLinks(footer.quickLinks || DEFAULT_FOOTER_SETTINGS.quickLinks);
      setCustomerSupportLinks(footer.customerSupportLinks || DEFAULT_FOOTER_SETTINGS.customerSupportLinks);
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

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const res = await uploadService.uploadImage(file, 'branding');
      if (res.success && res.url) {
        setLogoUrl(res.url);
        showToast('Logo image uploaded! Save settings to publish live.');
      } else {
        showError(res.error || 'Failed to upload logo.');
      }
    } catch (err: any) {
      showError(err.message || 'Logo upload failed.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleAddFooterLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) {
      showError('Please enter both link label and destination URL.');
      return;
    }

    const newLink: FooterQuickLink = {
      label: newLinkLabel.trim(),
      url: newLinkUrl.trim()
    };

    if (newLinkGroup === 'quick') {
      setQuickLinks([...quickLinks, newLink]);
    } else {
      setCustomerSupportLinks([...customerSupportLinks, newLink]);
    }

    setNewLinkLabel('');
    setNewLinkUrl('');
    showToast(`Added "${newLink.label}" to ${newLinkGroup === 'quick' ? 'Quick Links' : 'Customer Support'}!`);
  };

  const handleRemoveFooterLink = (group: 'quick' | 'support', idx: number) => {
    if (group === 'quick') {
      setQuickLinks(quickLinks.filter((_, i) => i !== idx));
    } else {
      setCustomerSupportLinks(customerSupportLinks.filter((_, i) => i !== idx));
    }
    showToast('Footer link removed.');
  };

  const handleSaveGeneralAndWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedAdminSettings: AdminSettings = {
        id: 'global',
        siteName: siteName.trim(),
        logoUrl: logoUrl.trim(),
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
        number: whatsappNumber.trim().replace(/[^0-9]/g, ''),
        buttonText: whatsappButtonText.trim(),
        isActive: whatsappActive,
        position: whatsappPosition,
        displayPages: 'all',
        tagMessage: whatsappTagMessage.trim(),
        generalMessage: whatsappGeneralMsg.trim(),
        customerEnquiryTemplate: whatsappCustomerEnquiry.trim(),
        itemEnquiryTemplate: whatsappItemEnquiry.trim(),
        orderMessageTemplate: whatsappOrderTemplate.trim(),
        contactMessageTemplate: whatsappContactMessage.trim(),
        updatedAt: Date.now()
      };

      await Promise.all([
        ottApi.saveAdminSettings(updatedAdminSettings),
        ottApi.saveWhatsAppSettings(updatedWhatsApp)
      ]);

      await ottApi.logAudit('UPDATE_SETTINGS', 'admin_settings', 'global', { siteName, whatsapp: whatsappNumber });
      showToast('Store settings & WhatsApp templates saved successfully! Live storefront updated.');
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
      const updatedFooter: FooterSettings = {
        description: footerDesc.trim(),
        tagline: footerTagline.trim(),
        copyrightText: footerCopyright.trim(),
        quickLinks,
        customerSupportLinks,
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
      showToast('Footer links & content saved and synced with live store!');
    } catch (err: any) {
      showError(err?.message || 'Failed to update footer.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItemsCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedCMS: ItemsPageCMS = {
        mainHeading: itemsMainHeading.trim() || DEFAULT_ITEMS_PAGE_CMS.mainHeading,
        mainSubtitle: itemsMainSubtitle.trim() || DEFAULT_ITEMS_PAGE_CMS.mainSubtitle,
        quickSearchHeading: itemsQuickSearchHeading.trim() || DEFAULT_ITEMS_PAGE_CMS.quickSearchHeading,
        categoriesHeading: itemsCategoriesHeading.trim() || DEFAULT_ITEMS_PAGE_CMS.categoriesHeading,
        itemsListingHeading: itemsListingHeading.trim() || DEFAULT_ITEMS_PAGE_CMS.itemsListingHeading,
        updatedAt: Date.now()
      };

      await ottApi.saveItemsPageCMS(updatedCMS);
      await ottApi.logAudit('UPDATE_ITEMS_PAGE_CMS', 'settings', 'items_page_cms', updatedCMS);
      showToast('Items Page headings updated & synced live!');
    } catch (err: any) {
      showError(err?.message || 'Failed to save Items Page headings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetItemsCMS = () => {
    setItemsMainHeading(DEFAULT_ITEMS_PAGE_CMS.mainHeading);
    setItemsMainSubtitle(DEFAULT_ITEMS_PAGE_CMS.mainSubtitle);
    setItemsQuickSearchHeading(DEFAULT_ITEMS_PAGE_CMS.quickSearchHeading);
    setItemsCategoriesHeading(DEFAULT_ITEMS_PAGE_CMS.categoriesHeading);
    setItemsListingHeading(DEFAULT_ITEMS_PAGE_CMS.itemsListingHeading);
    showToast('Reset headings to standard defaults. Click "Save Changes" to publish.');
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingPassword.trim()) {
      showError('Please enter your existing password to authorize the change.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      showError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New password and confirmation password do not match.');
      return;
    }

    setPasswordUpdating(true);
    try {
      const res = await changePassword(existingPassword, newPassword);
      if (res.success) {
        showToast('Admin password updated and verified successfully! Use new password on next login.');
        setExistingPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showError(res.error || 'Failed to change password. Please check your existing password.');
      }
    } catch (err: any) {
      showError(err?.message || 'Password update failed.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const previewWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappGeneralMsg || 'Hi OTT Sellers! I need instant subscription assistance.')}`;

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Settings className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Store Settings, WhatsApp & CMS Configuration</span>
          </h1>
          <p className="admin-sub-text">
            Configure site branding, logos, WhatsApp helpline, footer links, SMTP, Razorpay keys & admin security.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh database"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="admin-alert-banner error">
          <AlertCircle size={16} />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="admin-tabs-row" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <Settings size={14} style={{ marginRight: '6px' }} />
          <span>General & Branding</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => setActiveTab('whatsapp')}
        >
          <MessageSquare size={14} style={{ marginRight: '6px' }} />
          <span>WhatsApp CMS</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'footer' ? 'active' : ''}`}
          onClick={() => setActiveTab('footer')}
        >
          <LinkIcon size={14} style={{ marginRight: '6px' }} />
          <span>Footer CMS & Links</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'items_cms' ? 'active' : ''}`}
          onClick={() => setActiveTab('items_cms')}
        >
          <Sparkles size={14} style={{ marginRight: '6px' }} />
          <span>Items Page Headings</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Lock size={14} style={{ marginRight: '6px' }} />
          <span>Admin Security ({ADMIN_CONFIG.EMAIL})</span>
        </button>
      </div>

      {/* TAB 1: General & Logo Branding */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneralAndWhatsApp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Website Logo & Branding</h2>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: '#0b132b', padding: '10px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <img src={logoUrl} alt="Logo Preview" style={{ maxHeight: '50px', objectFit: 'contain' }} />
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <label className="admin-form-label">Logo Image URL</label>
                <input type="text" className="admin-form-input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                <div style={{ marginTop: '8px' }}>
                  <input type="file" id="logo-file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadLogo} />
                  <label htmlFor="logo-file" className="btn-refresh-action" style={{ cursor: 'pointer', display: 'inline-flex', gap: '6px', fontSize: '0.78rem' }}>
                    <Upload size={14} />
                    <span>{isUploadingLogo ? 'Uploading...' : 'Upload Replacement Logo'}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Site Info & Top Announcement</h2>

            <div className="admin-form-row-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Site Title / Store Name</label>
                <input type="text" className="admin-form-input" value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Authorized Admin Email</label>
                <input type="email" className="admin-form-input" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Header Announcement Bar Text</label>
              <textarea rows={2} className="admin-form-input" value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} />
            </div>

            <div className="admin-form-row-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Support Phone Number</label>
                <input type="text" className="admin-form-input" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Razorpay Key ID</label>
                <input type="text" className="admin-form-input" value={razorpayKeyId} onChange={(e) => setRazorpayKeyId(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" disabled={saving} className="btn-primary-action" style={{ padding: '10px 24px' }}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save General Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: WhatsApp CMS (Module 9.1 & 9.2) */}
      {activeTab === 'whatsapp' && (
        <form onSubmit={handleSaveGeneralAndWhatsApp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="#22c55e" />
              <span>WhatsApp Helpline & Floating Click-to-Chat</span>
            </h2>

            <div className="admin-form-row-2">
              <div className="admin-form-group">
                <label className="admin-form-label">WhatsApp Helpline Phone Number (With Country Code) *</label>
                <input type="text" className="admin-form-input" placeholder="e.g. 9441323332" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} required />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Floating Button Text</label>
                <input type="text" className="admin-form-input" value={whatsappButtonText} onChange={(e) => setWhatsappButtonText(e.target.value)} />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Floating Tooltip Tagline Message</label>
              <input type="text" className="admin-form-input" value={whatsappTagMessage} onChange={(e) => setWhatsappTagMessage(e.target.value)} />
            </div>
          </div>

          {/* Module 9: WhatsApp Message Templates CMS */}
          <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#38bdf8" />
              <span>Editable WhatsApp Message Templates (Click-to-Chat & Pre-filled Texts)</span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Customize the automated prefilled messages opened when customers click WhatsApp buttons on various pages. Dynamic tags like <code>{'{productName}'}</code>, <code>{'{duration}'}</code>, <code>{'{price}'}</code>, and <code>{'{orderId}'}</code> will be auto-replaced.
            </p>

            {/* Template 1: General Message */}
            <div style={{ background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
              <label className="admin-form-label" style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                1. General WhatsApp Chat Message
              </label>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Triggered when customer clicks the floating bottom-right WhatsApp widget or global helpline.
              </span>
              <textarea
                rows={2}
                className="admin-form-input"
                value={whatsappGeneralMsg}
                onChange={(e) => setWhatsappGeneralMsg(e.target.value)}
                placeholder="e.g. Hello OTT Sellers! I have an inquiry regarding subscription services."
              />
            </div>

            {/* Template 2: Customer Enquiry Message */}
            <div style={{ background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
              <label className="admin-form-label" style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                2. Customer Product Enquiry Message
              </label>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Triggered on product enquiry actions. Supported tags: <code>{'{productName}'}</code>
              </span>
              <textarea
                rows={2}
                className="admin-form-input"
                value={whatsappCustomerEnquiry}
                onChange={(e) => setWhatsappCustomerEnquiry(e.target.value)}
                placeholder="e.g. Hi OTT Sellers, I would like to know more about {productName}."
              />
            </div>

            {/* Template 3: Item Enquiry Message */}
            <div style={{ background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
              <label className="admin-form-label" style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                3. Item / Subscription Plan Enquiry Message
              </label>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Triggered when customer clicks WhatsApp button on product details. Supported tags: <code>{'{productName}'}</code>, <code>{'{duration}'}</code>, <code>{'{price}'}</code>
              </span>
              <textarea
                rows={2}
                className="admin-form-input"
                value={whatsappItemEnquiry}
                onChange={(e) => setWhatsappItemEnquiry(e.target.value)}
                placeholder="e.g. Hi OTT Sellers! Is {productName} ({duration}) available for ₹{price}?"
              />
            </div>

            {/* Template 4: Order Delivery Template */}
            <div style={{ background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
              <label className="admin-form-label" style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                4. Order Message & Delivery Template
              </label>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Used when sending credentials or order receipts on WhatsApp. Supported tags: <code>{'{orderId}'}</code>, <code>{'{customerName}'}</code>, <code>{'{items}'}</code>, <code>{'{total}'}</code>
              </span>
              <textarea
                rows={4}
                className="admin-form-input"
                value={whatsappOrderTemplate}
                onChange={(e) => setWhatsappOrderTemplate(e.target.value)}
              />
            </div>

            {/* Template 5: Contact Page Message */}
            <div style={{ background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
              <label className="admin-form-label" style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                5. Contact Us Page Message
              </label>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Prefilled when reaching out via Contact Us page.
              </span>
              <textarea
                rows={2}
                className="admin-form-input"
                value={whatsappContactMessage}
                onChange={(e) => setWhatsappContactMessage(e.target.value)}
                placeholder="e.g. Hi OTT Sellers Team, I am reaching out from your website contact page."
              />
            </div>

            <div style={{ background: '#0b132b', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Live WhatsApp URL Preview:</span>
              <code style={{ fontSize: '0.78rem', color: '#cbd5e1', wordBreak: 'break-all' }}>{previewWhatsAppUrl}</code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" disabled={saving} className="btn-primary-action" style={{ padding: '10px 24px' }}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save All WhatsApp Templates'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: Footer Links */}
      {activeTab === 'footer' && (
        <form onSubmit={handleSaveFooter} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Add New Footer Link</h2>

            <div className="admin-form-row-3">
              <div className="admin-form-group">
                <label className="admin-form-label">Link Label</label>
                <input type="text" className="admin-form-input" placeholder="e.g. Terms & Refund Policy" value={newLinkLabel} onChange={(e) => setNewLinkLabel(e.target.value)} />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Destination URL / Route</label>
                <input type="text" className="admin-form-input" placeholder="e.g. /items or https://..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Footer Group Section</label>
                <select className="admin-form-select" value={newLinkGroup} onChange={(e) => setNewLinkGroup(e.target.value as any)}>
                  <option value="quick">Quick Links Column</option>
                  <option value="support">Customer Support Column</option>
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={handleAddFooterLink} className="btn-primary-action" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add Link to List
              </button>
            </div>
          </div>

          <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>Current Footer Links List</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#0b132b', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <h4 style={{ margin: '0 0 10px', color: '#38bdf8', fontSize: '0.86rem' }}>Quick Links Column ({quickLinks.length})</h4>
                {quickLinks.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '0.82rem', color: '#fff' }}>{l.label} ({l.url})</span>
                    <button type="button" onClick={() => handleRemoveFooterLink('quick', i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>

              <div style={{ background: '#0b132b', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <h4 style={{ margin: '0 0 10px', color: '#38bdf8', fontSize: '0.86rem' }}>Customer Support Column ({customerSupportLinks.length})</h4>
                {customerSupportLinks.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '0.82rem', color: '#fff' }}>{l.label} ({l.url})</span>
                    <button type="button" onClick={() => handleRemoveFooterLink('support', i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" disabled={saving} className="btn-primary-action" style={{ padding: '10px 24px' }}>
                <Save size={16} />
                <span>Save All Footer Links</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: Items Page Headings & CMS */}
      {activeTab === 'items_cms' && (
        <form onSubmit={handleSaveItemsCMS} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#38bdf8" />
                  <span>Items & Subscriptions Page Headings</span>
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Customize the customer-facing headings, subtitles, and section titles on the /items catalog page.
                </p>
              </div>
              <button 
                type="button" 
                onClick={handleResetItemsCMS}
                className="btn-refresh-action"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                title="Reset to default text"
              >
                Reset Defaults
              </button>
            </div>

            {/* 1. Main Page Title */}
            <div className="admin-form-group">
              <label className="admin-form-label">1. Main Items Page Heading *</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. All Subscriptions & Premium Accounts"
                value={itemsMainHeading}
                onChange={(e) => setItemsMainHeading(e.target.value)}
                required
              />
              <span className="admin-form-hint">Displayed as the primary H1 heading at top of the items catalog page.</span>
            </div>

            {/* 2. Main Page Subtitle */}
            <div className="admin-form-group">
              <label className="admin-form-label">2. Main Page Subtitle / Tagline</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. 100% verified private profiles, instant WhatsApp delivery & replacement guarantee."
                value={itemsMainSubtitle}
                onChange={(e) => setItemsMainSubtitle(e.target.value)}
              />
              <span className="admin-form-hint">Brief subtitle text beneath the main title.</span>
            </div>

            {/* 3. Quick Search Heading */}
            <div className="admin-form-group">
              <label className="admin-form-label">3. Quick Search Section Heading *</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. Quick Search"
                value={itemsQuickSearchHeading}
                onChange={(e) => setItemsQuickSearchHeading(e.target.value)}
                required
              />
              <span className="admin-form-hint">Label for the provider filter chip bar (e.g. Quick Search or ⚡ Quick Search).</span>
            </div>

            {/* 4. Categories Section Heading */}
            <div className="admin-form-group">
              <label className="admin-form-label">4. Categories Grid Heading *</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. Explore Categories"
                value={itemsCategoriesHeading}
                onChange={(e) => setItemsCategoriesHeading(e.target.value)}
                required
              />
              <span className="admin-form-hint">Heading for the side-by-side category selector cards.</span>
            </div>

            {/* 5. Items Listing Heading */}
            <div className="admin-form-group">
              <label className="admin-form-label">5. Items Results / Listing Heading *</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. All Available Plans"
                value={itemsListingHeading}
                onChange={(e) => setItemsListingHeading(e.target.value)}
                required
              />
              <span className="admin-form-hint">Header above the product cards grid and sort dropdown.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" disabled={saving} className="btn-primary-action" style={{ padding: '10px 24px' }}>
                <Save size={16} />
                <span>{saving ? 'Saving Headings...' : 'Save & Publish Headings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 5: Admin Security — Change Password (Module 10) */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '600px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="#38bdf8" />
                <span>Change Administrator Password</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Securely update the password for authorized admin account <strong>{ADMIN_CONFIG.EMAIL}</strong>.
              </p>
            </div>

            {/* Field 1: Existing Password */}
            <div className="admin-form-group">
              <label className="admin-form-label">1. Existing Current Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showExistingPass ? 'text' : 'password'}
                  className="admin-form-input"
                  placeholder="Enter current password"
                  value={existingPassword}
                  onChange={(e) => setExistingPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowExistingPass(!showExistingPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showExistingPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Field 2: New Password */}
            <div className="admin-form-group">
              <label className="admin-form-label">2. New Password * (Min 6 characters)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  className="admin-form-input"
                  placeholder="Enter new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Field 3: Confirm New Password */}
            <div className="admin-form-group">
              <label className="admin-form-label">3. Confirm New Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  className="admin-form-input"
                  placeholder="Re-type new password to confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" disabled={passwordUpdating} className="btn-primary-action" style={{ padding: '10px 24px' }}>
                <Lock size={16} />
                <span>{passwordUpdating ? 'Verifying & Updating...' : 'Update Password Securely'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminSettingsPage;

