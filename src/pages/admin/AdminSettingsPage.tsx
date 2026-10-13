import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Check, ShieldCheck, Mail, Phone, 
  MessageSquare, CreditCard, Bell, Key, RefreshCw, AlertCircle, 
  Sparkles, Lock, Link as LinkIcon, Gift, User, Send, CheckCircle2, Upload, Plus, Trash2, Edit2, Eye, EyeOff, Image as ImageIcon
} from 'lucide-react';
import { 
  ottApi, ADMIN_CONFIG, DEFAULT_FOOTER_SETTINGS, 
  DEFAULT_WHATSAPP_SETTINGS, DEFAULT_REFERRAL_SETTINGS, DEFAULT_ITEMS_PAGE_CMS, 
  DEFAULT_PROMO_MODAL_SETTINGS, DEFAULT_OFFERS_PAGE_CMS, getCleanImageUrl 
} from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  AdminSettings, FooterSettings, WhatsAppSettings, ReferralSettings, FooterQuickLink, ItemsPageCMS,
  PromoOfferModalSettings, OffersPageCMS
} from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { changePassword } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'whatsapp' | 'footer' | 'items_cms' | 'promo_modal' | 'offers_cms' | 'security'>('general');
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

  // Promo Modal CMS State (Image Copy 32)
  const [promoIsEnabled, setPromoIsEnabled] = useState(DEFAULT_PROMO_MODAL_SETTINGS.isActive ?? true);
  const [promoBadgeText, setPromoBadgeText] = useState(DEFAULT_PROMO_MODAL_SETTINGS.badgeText || '');
  const [promoTitle, setPromoTitle] = useState(DEFAULT_PROMO_MODAL_SETTINGS.heading || DEFAULT_PROMO_MODAL_SETTINGS.title || '');
  const [promoDescription, setPromoDescription] = useState(DEFAULT_PROMO_MODAL_SETTINGS.description || '');
  const [promoCouponCode, setPromoCouponCode] = useState(DEFAULT_PROMO_MODAL_SETTINGS.couponCode || '');
  const [promoButtonText, setPromoButtonText] = useState(DEFAULT_PROMO_MODAL_SETTINGS.buttonText || '');
  const [promoButtonLink, setPromoButtonLink] = useState(DEFAULT_PROMO_MODAL_SETTINGS.buttonLink || '');
  const [promoFeaturesText, setPromoFeaturesText] = useState(
    (DEFAULT_PROMO_MODAL_SETTINGS.features || [DEFAULT_PROMO_MODAL_SETTINGS.feature1, DEFAULT_PROMO_MODAL_SETTINGS.feature2]).filter(Boolean).join('\n')
  );
  const [promoDelaySeconds, setPromoDelaySeconds] = useState(DEFAULT_PROMO_MODAL_SETTINGS.delaySeconds || 5);

  // Offers Page CMS State (Image Copy 37, 38)
  const [offersHeading, setOffersHeading] = useState(DEFAULT_OFFERS_PAGE_CMS.heading || '');
  const [offersSubtitle, setOffersSubtitle] = useState(DEFAULT_OFFERS_PAGE_CMS.subtitle || DEFAULT_OFFERS_PAGE_CMS.subheading || '');
  const [offersBannerImage, setOffersBannerImage] = useState(DEFAULT_OFFERS_PAGE_CMS.bannerImageUrl || '/hero-bg.png');
  const [offersBannerLink, setOffersBannerLink] = useState(DEFAULT_OFFERS_PAGE_CMS.bannerLink || '/items');
  const [offersBannerActive, setOffersBannerActive] = useState(DEFAULT_OFFERS_PAGE_CMS.bannerActive ?? true);
  const [isUploadingOffersBanner, setIsUploadingOffersBanner] = useState(false);

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
      const [s, footer, ws, itemsCms, promoCms, offersCms] = await Promise.all([
        ottApi.getAdminSettings(),
        ottApi.getFooterSettings(),
        ottApi.getWhatsAppSettings(),
        ottApi.getItemsPageCMS(),
        ottApi.getPromoModalSettings(),
        ottApi.getOffersPageCMS()
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
        setItemsMainHeading(itemsCms.mainHeading || '');
        setItemsMainSubtitle(itemsCms.mainSubtitle || '');
        setItemsQuickSearchHeading(itemsCms.quickSearchHeading || 'Quick Search');
        setItemsCategoriesHeading(itemsCms.categoriesHeading || 'Explore Categories');
        setItemsListingHeading(itemsCms.itemsListingHeading || 'All Available Plans');
      }

      // Promo Offer Modal CMS
      if (promoCms) {
        setPromoIsEnabled(promoCms.isActive !== false && promoCms.isEnabled !== false);
        setPromoBadgeText(promoCms.badgeText || 'LIMITED TIME PROMO');
        setPromoTitle(promoCms.heading || promoCms.title || 'Unlock Extra 20% OFF Your First Subscription!');
        setPromoDescription(promoCms.description || '');
        setPromoCouponCode(promoCms.couponCode || 'OTT20');
        setPromoButtonText(promoCms.buttonText || 'Claim Deal & Browse Plans');
        setPromoButtonLink(promoCms.buttonLink || '/items');
        setPromoFeaturesText((promoCms.features || [promoCms.feature1, promoCms.feature2]).filter(Boolean).join('\n'));
        setPromoDelaySeconds(promoCms.delaySeconds || 5);
      }

      // Offers Page CMS
      if (offersCms) {
        setOffersHeading(offersCms.heading || 'Exclusive OTT Offers & Special Deals');
        setOffersSubtitle(offersCms.subtitle || 'Hand-picked premium subscriptions with special festival pricing and instant WhatsApp activation.');
        setOffersBannerImage(offersCms.bannerImageUrl || '/hero-bg.png');
        setOffersBannerLink(offersCms.bannerLink || '/items');
        setOffersBannerActive(offersCms.bannerActive ?? true);
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
        mainHeading: itemsMainHeading.trim(),
        mainSubtitle: itemsMainSubtitle.trim(),
        quickSearchHeading: itemsQuickSearchHeading.trim() || 'Quick Search',
        categoriesHeading: itemsCategoriesHeading.trim() || 'Explore Categories',
        itemsListingHeading: itemsListingHeading.trim() || 'All Available Plans',
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
    setItemsMainHeading('');
    setItemsMainSubtitle('');
    setItemsQuickSearchHeading('Quick Search');
    setItemsCategoriesHeading('Explore Categories');
    setItemsListingHeading('All Available Plans');
    showToast('Reset headings to standard defaults. Click "Save Changes" to publish.');
  };

  const handleSavePromoModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const featArr = promoFeaturesText.split('\n').map((s: string) => s.trim()).filter(Boolean);
      const updated: PromoOfferModalSettings = {
        isActive: promoIsEnabled,
        isEnabled: promoIsEnabled,
        badgeText: promoBadgeText.trim(),
        heading: promoTitle.trim(),
        title: promoTitle.trim(),
        description: promoDescription.trim(),
        couponCode: promoCouponCode.trim(),
        buttonText: promoButtonText.trim(),
        buttonLink: promoButtonLink.trim(),
        feature1: featArr[0] || '⚡ 5-Min WhatsApp Delivery',
        feature2: featArr[1] || '🔒 100% Replacement Warranty',
        features: featArr,
        delaySeconds: Number(promoDelaySeconds) || 5
      };
      await ottApi.savePromoModalSettings(updated);
      showToast('Promo Coupon Modal settings saved! Live storefront updated.');
    } catch (err: any) {
      showError(err?.message || 'Failed to save Promo Modal settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOffersCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: OffersPageCMS = {
        heading: (offersHeading || '').trim(),
        subtitle: (offersSubtitle || '').trim(),
        subheading: (offersSubtitle || '').trim(),
        bannerImageUrl: (offersBannerImage || '').trim(),
        bannerLink: (offersBannerLink || '').trim(),
        bannerActive: offersBannerActive
      };
      await ottApi.saveOffersPageCMS(updated);
      showToast('Offers Page settings saved! Live storefront updated.');
    } catch (err: any) {
      showError(err?.message || 'Failed to save Offers Page settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadOffersBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingOffersBanner(true);
    const res = await uploadService.uploadImage(file, 'banners');
    setIsUploadingOffersBanner(false);
    if (res.success && res.url) {
      setOffersBannerImage(res.url);
      showToast('Offers banner uploaded successfully!');
    } else {
      showError(res.error || 'Failed to upload offers banner.');
    }
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
          className={`admin-tab-btn ${activeTab === 'promo_modal' ? 'active' : ''}`}
          onClick={() => setActiveTab('promo_modal')}
        >
          <Bell size={14} style={{ marginRight: '6px' }} />
          <span>Promo Coupon Popup</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'offers_cms' ? 'active' : ''}`}
          onClick={() => setActiveTab('offers_cms')}
        >
          <Gift size={14} style={{ marginRight: '6px' }} />
          <span>Offers Page CMS</span>
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
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Website Logo & Branding</h2>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
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

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Site Info & Top Announcement</h2>

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
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#0284c7" />
              <span>Editable WhatsApp Message Templates (Click-to-Chat & Pre-filled Texts)</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Customize the automated prefilled messages opened when customers click WhatsApp buttons on various pages. Dynamic tags like <code>{'{productName}'}</code>, <code>{'{duration}'}</code>, <code>{'{price}'}</code>, and <code>{'{orderId}'}</code> will be auto-replaced.
            </p>

            {/* Template 1: General Message */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <label className="admin-form-label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                1. General WhatsApp Chat Message
              </label>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
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
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <label className="admin-form-label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                2. Customer Product Enquiry Message
              </label>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
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
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <label className="admin-form-label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                3. Item / Subscription Plan Enquiry Message
              </label>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
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
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <label className="admin-form-label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                4. Order Message & Delivery Template
              </label>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
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
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <label className="admin-form-label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                5. Contact Us Page Message
              </label>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
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

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Live WhatsApp URL Preview:</span>
              <code style={{ fontSize: '0.78rem', color: '#334155', wordBreak: 'break-all' }}>{previewWhatsAppUrl}</code>
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
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Add New Footer Link</h2>

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

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>Current Footer Links List</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px', color: '#0284c7', fontSize: '0.86rem', fontWeight: 800 }}>Quick Links Column ({quickLinks.length})</h4>
                {quickLinks.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.82rem', color: '#0f172a' }}><strong>{l.label}</strong> <span style={{ color: '#64748b', fontSize: '0.76rem' }}>({l.url})</span></span>
                    <button type="button" onClick={() => handleRemoveFooterLink('quick', i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }} title="Remove link"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px', color: '#0284c7', fontSize: '0.86rem', fontWeight: 800 }}>Customer Support Column ({customerSupportLinks.length})</h4>
                {customerSupportLinks.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.82rem', color: '#0f172a' }}><strong>{l.label}</strong> <span style={{ color: '#64748b', fontSize: '0.76rem' }}>({l.url})</span></span>
                    <button type="button" onClick={() => handleRemoveFooterLink('support', i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }} title="Remove link"><Trash2 size={13} /></button>
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
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#0284c7" />
                  <span>Items & Subscriptions Page Headings</span>
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
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

            {/* 1. Main Page Title (Optional - can be empty to hide) */}
            <div className="admin-form-group">
              <label className="admin-form-label">1. Main Items Page Heading (Leave empty to hide completely)</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. All Subscriptions & Premium Accounts (or leave empty to hide)"
                value={itemsMainHeading}
                onChange={(e) => setItemsMainHeading(e.target.value)}
              />
              <span className="admin-form-hint">Displayed as the primary H1 heading at top of the items catalog page. Leave blank to hide the header block completely.</span>
            </div>

            {/* 2. Main Page Subtitle */}
            <div className="admin-form-group">
              <label className="admin-form-label">2. Main Page Subtitle / Tagline (Optional)</label>
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
              <label className="admin-form-label">3. Quick Search Section Heading</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. Quick Search"
                value={itemsQuickSearchHeading}
                onChange={(e) => setItemsQuickSearchHeading(e.target.value)}
              />
              <span className="admin-form-hint">Label for the provider filter chip bar (e.g. Quick Search or ⚡ Quick Search).</span>
            </div>

            {/* 4. Categories Section Heading */}
            <div className="admin-form-group">
              <label className="admin-form-label">4. Categories Grid Heading</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. Explore Categories"
                value={itemsCategoriesHeading}
                onChange={(e) => setItemsCategoriesHeading(e.target.value)}
              />
              <span className="admin-form-hint">Heading for the side-by-side category selector cards.</span>
            </div>

            {/* 5. Items Listing Heading */}
            <div className="admin-form-group">
              <label className="admin-form-label">5. Items Results / Listing Heading</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. All Available Plans"
                value={itemsListingHeading}
                onChange={(e) => setItemsListingHeading(e.target.value)}
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

      {/* TAB: Promo Coupon Notification Modal CMS (Image Copy 32) */}
      {activeTab === 'promo_modal' && (
        <form onSubmit={handleSavePromoModal} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} color="#0284c7" />
                  <span>Promotional Coupon Popup Notification</span>
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  Customer-facing automatic discount popup notification with master ON/OFF switch.
                </p>
              </div>

              {/* Master ON/OFF Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: promoIsEnabled ? '#22c55e' : '#ef4444' }}>
                  {promoIsEnabled ? '● Active (ON)' : '○ Disabled (OFF)'}
                </span>
                <button
                  type="button"
                  onClick={() => setPromoIsEnabled(!promoIsEnabled)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${promoIsEnabled ? '#22c55e' : '#ef4444'}`,
                    background: promoIsEnabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: promoIsEnabled ? '#22c55e' : '#ef4444',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {promoIsEnabled ? 'Turn OFF' : 'Turn ON'}
                </button>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Top Badge Text</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. LIMITED TIME PROMO"
                value={promoBadgeText}
                onChange={(e) => setPromoBadgeText(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Main Heading / Title</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. Unlock Extra 20% OFF Your First Subscription!"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Description / Subtitle</label>
              <textarea
                rows={2}
                className="admin-form-input"
                placeholder="Brief explanatory discount text..."
                value={promoDescription}
                onChange={(e) => setPromoDescription(e.target.value)}
              />
            </div>

            <div className="admin-form-row-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Coupon Code to Copy</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. OTT20"
                  value={promoCouponCode}
                  onChange={(e) => setPromoCouponCode(e.target.value)}
                  style={{ fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Popup Delay (in seconds)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="admin-form-input"
                  value={promoDelaySeconds}
                  onChange={(e) => setPromoDelaySeconds(parseInt(e.target.value) || 5)}
                />
              </div>
            </div>

            <div className="admin-form-row-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Call-to-Action Button Text</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Claim Deal & Browse Plans"
                  value={promoButtonText}
                  onChange={(e) => setPromoButtonText(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Button Destination URL</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. /items or /catalogs"
                  value={promoButtonLink}
                  onChange={(e) => setPromoButtonLink(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Trust Bullet Points (One per line)</label>
              <textarea
                rows={3}
                className="admin-form-input"
                placeholder="⚡ 5-Min WhatsApp Delivery&#10;🔒 100% Replacement Warranty"
                value={promoFeaturesText}
                onChange={(e) => setPromoFeaturesText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" disabled={saving} className="btn-primary-action" style={{ padding: '10px 24px' }}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Promo Modal Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB: Offers Page CMS (Image Copy 37, 38) */}
      {activeTab === 'offers_cms' && (
        <form onSubmit={handleSaveOffersCMS} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift size={18} color="#0284c7" />
                <span>Offers Page Headings & Top Banner</span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Configure the top promotional banner graphic and customer-facing headings for the /offers page.
              </p>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Offers Page Main Heading</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. Exclusive OTT Offers & Special Deals"
                value={offersHeading}
                onChange={(e) => setOffersHeading(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Offers Page Subtitle</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. Hand-picked premium subscriptions with special festival pricing..."
                value={offersSubtitle}
                onChange={(e) => setOffersSubtitle(e.target.value)}
              />
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className="admin-form-label" style={{ fontWeight: 700, margin: 0 }}>
                  Offers Page Top Banner
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#0f172a', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={offersBannerActive}
                    onChange={(e) => setOffersBannerActive(e.target.checked)}
                  />
                  <span>Show Top Banner on Offers Page</span>
                </label>
              </div>

              {offersBannerImage && (
                <div style={{ marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', maxHeight: '160px', border: '1px solid #e2e8f0' }}>
                  <img src={getCleanImageUrl(offersBannerImage)} alt="Offers Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Banner Image URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={offersBannerImage}
                    onChange={(e) => setOffersBannerImage(e.target.value)}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <input type="file" id="offers-banner-file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadOffersBanner} />
                    <label htmlFor="offers-banner-file" className="btn-refresh-action" style={{ cursor: 'pointer', display: 'inline-flex', gap: '6px', fontSize: '0.78rem' }}>
                      <Upload size={14} />
                      <span>{isUploadingOffersBanner ? 'Uploading...' : 'Upload Replacement Banner'}</span>
                    </label>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Banner Click Destination URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. /items"
                    value={offersBannerLink}
                    onChange={(e) => setOffersBannerLink(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" disabled={saving} className="btn-primary-action" style={{ padding: '10px 24px' }}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Offers Page CMS'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 5: Admin Security — Change Password (Module 10) */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '600px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="#0284c7" />
                <span>Change Administrator Password</span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
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
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
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
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
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
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
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

