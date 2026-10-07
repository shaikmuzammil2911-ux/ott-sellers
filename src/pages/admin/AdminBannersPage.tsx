import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  Image as ImageIcon, RefreshCw, AlertCircle, Eye, EyeOff, 
  Copy, Layers, Smartphone, Monitor, Sliders, ExternalLink 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { HeroBanner, BannerTargetPage, BannerDisplayStyle } from '../../types';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>(() => ottApi.getCachedBannersAdmin());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('SPECIAL OFFER');
  const [formTitleColor, setFormTitleColor] = useState('#ffffff');
  const [formSubtitleColor, setFormSubtitleColor] = useState('#cbd5e1');
  const [formBadgeColor, setFormBadgeColor] = useState('#38bdf8');
  const [formCtaText, setFormCtaText] = useState('Shop Now');
  const [formCtaLink, setFormCtaLink] = useState('/items');
  const [formSecondaryCtaText, setFormSecondaryCtaText] = useState('');
  const [formSecondaryCtaLink, setFormSecondaryCtaLink] = useState('');
  const [formDesktopImage, setFormDesktopImage] = useState('');
  const [formMobileImage, setFormMobileImage] = useState('');
  const [formTargetPage, setFormTargetPage] = useState<BannerTargetPage>('home');
  const [formSlot, setFormSlot] = useState('01');
  const [formStyle, setFormStyle] = useState<BannerDisplayStyle>('auto-slide');
  const [formAutoplay, setFormAutoplay] = useState(true);
  const [formInterval, setFormInterval] = useState('5');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formStatus, setFormStatus] = useState<'ON' | 'OFF'>('ON');
  const [formShowText, setFormShowText] = useState(true);

  // Uploading state
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const bns = await ottApi.getAllBannersAdmin();
      setBanners(bns);
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
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormName('');
    setFormTitle('');
    setFormSubtitle('');
    setFormDescription('');
    setFormBadgeText('SPECIAL OFFER');
    setFormTitleColor('#ffffff');
    setFormSubtitleColor('#cbd5e1');
    setFormBadgeColor('#38bdf8');
    setFormCtaText('Shop Now');
    setFormCtaLink('/items');
    setFormSecondaryCtaText('');
    setFormSecondaryCtaLink('');
    setFormDesktopImage('');
    setFormMobileImage('');
    setFormTargetPage('home');
    setFormSlot('01');
    setFormStyle('auto-slide');
    setFormAutoplay(true);
    setFormInterval('5');
    setFormDisplayOrder(String(banners.length + 1));
    setFormStatus('ON');
    setFormShowText(true);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: HeroBanner) => {
    setEditingBanner(b);
    setFormName(b.name || b.title || 'Promotional Banner');
    setFormTitle(b.title || '');
    setFormSubtitle(b.subtitle || '');
    setFormDescription(b.description || '');
    setFormBadgeText(b.badgeText || '');
    setFormTitleColor(b.titleColor || '#ffffff');
    setFormSubtitleColor(b.subtitleColor || '#cbd5e1');
    setFormBadgeColor(b.badgeColor || '#38bdf8');
    setFormCtaText(b.ctaText || 'Shop Now');
    setFormCtaLink(b.ctaLink || '/items');
    setFormSecondaryCtaText(b.secondaryCtaText || '');
    setFormSecondaryCtaLink(b.secondaryCtaLink || '');
    setFormDesktopImage(b.desktopImage || '');
    setFormMobileImage(b.mobileImage || '');
    setFormTargetPage(b.page || 'home');
    setFormSlot(b.slot || '01');
    setFormStyle(b.style || 'auto-slide');
    setFormAutoplay(b.autoplay ?? true);
    setFormInterval(String(b.interval || 5));
    setFormDisplayOrder(String(b.displayOrder || 1));
    setFormStatus(b.status || 'ON');
    setFormShowText(b.showText ?? true);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (b: HeroBanner) => {
    const duplicated: HeroBanner = {
      ...b,
      id: 'bnr-' + Date.now(),
      name: `${b.name || b.title} (Copy)`,
      displayOrder: banners.length + 1,
      status: 'OFF',
      updatedAt: Date.now()
    };
    await ottApi.saveBanner(duplicated);
    showToast(`Banner duplicated as "${duplicated.name}". Initialized as Inactive.`);
    await loadData();
  };

  const handleUploadDesktop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDesktop(true);
    setUploadError(null);
    const res = await uploadService.uploadImage(file, 'banners');
    setIsUploadingDesktop(false);

    if (res.success && res.url) {
      setFormDesktopImage(res.url);
      if (!formMobileImage) setFormMobileImage(res.url);
    } else {
      setUploadError(res.error || 'Failed to upload desktop banner image.');
    }
  };

  const handleUploadMobile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMobile(true);
    setUploadError(null);
    const res = await uploadService.uploadImage(file, 'banners');
    setIsUploadingMobile(false);

    if (res.success && res.url) {
      setFormMobileImage(res.url);
    } else {
      setUploadError(res.error || 'Failed to upload mobile banner image.');
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesktopImage.trim() && !formTitle.trim()) {
      alert('Please provide either Banner Headline or Desktop Image artwork.');
      return;
    }

    const bannerData: HeroBanner = {
      id: editingBanner?.id || 'bnr-' + Date.now(),
      name: formName.trim() || formTitle.trim() || 'Promotional Banner',
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      description: formDescription.trim(),
      badgeText: formBadgeText.trim(),
      titleColor: formTitleColor,
      subtitleColor: formSubtitleColor,
      badgeColor: formBadgeColor,
      ctaText: formCtaText.trim() || 'Shop Now',
      ctaLink: formCtaLink.trim() || '/items',
      secondaryCtaText: formSecondaryCtaText.trim(),
      secondaryCtaLink: formSecondaryCtaLink.trim(),
      desktopImage: formDesktopImage.trim() || '/hero-bg.png',
      mobileImage: formMobileImage.trim() || formDesktopImage.trim() || '/hero-mobile-1.png',
      mode: 'image-only',
      textPosition: 'left',
      page: formTargetPage,
      slot: formSlot.trim() || '01',
      style: formStyle,
      autoplay: formAutoplay,
      interval: Number(formInterval) || 5,
      displayOrder: Number(formDisplayOrder) || 1,
      status: formStatus,
      showText: formShowText,
      updatedAt: Date.now()
    };

    await ottApi.saveBanner(bannerData);
    await ottApi.logAudit(editingBanner ? 'UPDATE_BANNER' : 'CREATE_BANNER', 'banners', bannerData.id, { 
      name: bannerData.name, 
      page: bannerData.page, 
      slot: bannerData.slot 
    });

    showToast(`Banner "${bannerData.name}" saved to database and synced with live store!`);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteBanner = async (id: string, name?: string) => {
    if (confirm(`Are you sure you want to delete banner "${name || 'this banner'}"? This action cannot be undone.`)) {
      await ottApi.deleteBanner(id);
      await ottApi.logAudit('DELETE_BANNER', 'banners', id);
      showToast('Banner permanently deleted.');
      await loadData();
    }
  };

  const handleToggleStatus = async (b: HeroBanner) => {
    const newStatus: 'ON' | 'OFF' = b.status === 'ON' ? 'OFF' : 'ON';
    const updated = { ...b, status: newStatus, updatedAt: Date.now() };
    await ottApi.saveBanner(updated);
    showToast(`Banner is now ${newStatus === 'ON' ? 'ACTIVE (Live)' : 'INACTIVE (Hidden)'}.`);
    await loadData();
  };

  const filteredBanners = banners.filter(b => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (b.name || '').toLowerCase().includes(q) ||
      (b.title || '').toLowerCase().includes(q) ||
      (b.page || '').toLowerCase().includes(q) ||
      (b.slot || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (pageFilter !== 'all' && b.page !== pageFilter) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <ImageIcon className="admin-heading-icon" style={{ color: '#e50914' }} />
            <span>Promotional Banners & Slot Manager</span>
          </h1>
          <p className="admin-sub-text">
            Create desktop and mobile banners, map them to specific pages and slots, and control rotation styles.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh from database"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary-action"
          >
            <Plus size={16} />
            <span>Create New Banner</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search banners by name, title, page or slot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Target Pages</option>
            <option value="home">Home Page</option>
            <option value="items">Items / Subscriptions</option>
            <option value="offers">Special Offers</option>
            <option value="courses">Courses & Masterclasses</option>
            <option value="categories">Categories</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Statuses</option>
            <option value="ON">Active Only</option>
            <option value="OFF">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Banners Grid / List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredBanners.map((b) => (
          <div
            key={b.id}
            style={{
              background: '#070d1e',
              border: `1px solid ${b.status === 'ON' ? '#1e293b' : '#334155'}`,
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              opacity: b.status === 'ON' ? 1 : 0.65
            }}
          >
            {/* Media Preview Box */}
            <div style={{ position: 'relative', width: '100%', height: '140px', background: '#0b132b', overflow: 'hidden' }}>
              <img
                src={getCleanImageUrl(b.desktopImage || '/hero-bg.png', b.updatedAt)}
                alt={b.title || b.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(7,13,30,0.85) 100%)' }} />

              {/* Status & Page Badge */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: b.status === 'ON' ? '#10b981' : '#64748b',
                  color: '#ffffff',
                  textTransform: 'uppercase'
                }}>
                  {b.status === 'ON' ? 'Active' : 'Inactive'}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(2, 132, 199, 0.85)',
                  color: '#ffffff'
                }}>
                  Page: {b.page.toUpperCase()} • Slot {b.slot}
                </span>
              </div>

              <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.title || b.name}
                </h3>
              </div>
            </div>

            {/* Info Body */}
            <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {b.subtitle && (
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {b.subtitle}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.74rem', color: '#94a3b8' }}>
                  <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                    Style: <strong>{b.style || 'auto-slide'}</strong>
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                    Order: #{b.displayOrder}
                  </span>
                  {b.ctaText && (
                    <span style={{ background: 'rgba(229,9,20,0.15)', color: '#ff6b6b', padding: '2px 6px', borderRadius: '4px' }}>
                      CTA: {b.ctaText}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(b)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #1e293b',
                    color: b.status === 'ON' ? '#e2e8f0' : '#94a3b8',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    cursor: 'pointer'
                  }}
                >
                  {b.status === 'ON' ? 'Deactivate' : 'Activate'}
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(b)}
                    title="Duplicate Banner"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #1e293b', color: '#cbd5e1', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(b)}
                    style={{ background: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(2, 132, 199, 0.3)', color: '#38bdf8', padding: '5px 10px', borderRadius: '6px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b.id, b.title || b.name)}
                    title="Delete Banner"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBanners.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', background: '#070d1e', borderRadius: '14px', border: '1px dashed #1e293b' }}>
          <ImageIcon size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p>No banners found matching the filter criteria.</p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingBanner ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="admin-modal-body" style={{ gap: '14px' }}>
              {uploadError && (
                <div className="admin-auth-alert error">
                  <AlertCircle size={16} />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* 1. Target Page, Slot & Ordering */}
              <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 14px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '10px' }}>
                  🎯 Banner Placement & Mapping
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <div className="form-group-compact">
                    <label>Where should banner appear? *</label>
                    <select
                      value={formTargetPage}
                      onChange={(e) => setFormTargetPage(e.target.value as BannerTargetPage)}
                    >
                      <option value="home">Home Page</option>
                      <option value="items">Items / Subscriptions</option>
                      <option value="offers">Special Offers</option>
                      <option value="courses">Courses</option>
                      <option value="categories">Categories</option>
                      <option value="all">All Store Pages</option>
                    </select>
                  </div>

                  <div className="form-group-compact">
                    <label>Banner Position / Slot *</label>
                    <select
                      value={formSlot}
                      onChange={(e) => setFormSlot(e.target.value)}
                    >
                      <option value="01">Slot 01 (Hero / Top)</option>
                      <option value="02">Slot 02 (Middle Showcase)</option>
                      <option value="03">Slot 03 (Bottom Deals)</option>
                    </select>
                  </div>

                  <div className="form-group-compact">
                    <label>Display Order</label>
                    <input
                      type="number"
                      min="1"
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(e.target.value)}
                    />
                  </div>

                  <div className="form-group-compact">
                    <label>Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'ON' | 'OFF')}
                    >
                      <option value="ON">Active (Visible)</option>
                      <option value="OFF">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Banner Style & Rotation */}
              <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 14px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '10px' }}>
                  🔄 Banner Display Style & Slider Settings
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <div className="form-group-compact">
                    <label>Display Style</label>
                    <select
                      value={formStyle}
                      onChange={(e) => setFormStyle(e.target.value as BannerDisplayStyle)}
                    >
                      <option value="auto-slide">Auto Slide (Rotating)</option>
                      <option value="manual-slide">Manual Slide (Swipe / Click)</option>
                      <option value="fixed">Fixed Static Banner</option>
                      <option value="single">Single Banner Only</option>
                    </select>
                  </div>

                  <div className="form-group-compact">
                    <label>Autoplay</label>
                    <select
                      value={formAutoplay ? 'yes' : 'no'}
                      onChange={(e) => setFormAutoplay(e.target.value === 'yes')}
                    >
                      <option value="yes">Enabled (Rotate)</option>
                      <option value="no">Disabled (Manual only)</option>
                    </select>
                  </div>

                  <div className="form-group-compact">
                    <label>Slide Interval (Seconds)</label>
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={formInterval}
                      onChange={(e) => setFormInterval(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Text & Content */}
              <div className="form-group-compact">
                <label>Internal Banner Name (for Admin Reference)</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. IPL 2026 Sports Pass Banner"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group-compact">
                  <label>Heading Text</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Stream All OTT in 4K Ultra HD"
                  />
                </div>
                <div className="form-group-compact">
                  <label>Badge Text</label>
                  <input
                    type="text"
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    placeholder="e.g. FLASH DEAL • 70% OFF"
                  />
                </div>
              </div>

              <div className="form-group-compact">
                <label>Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. Instant WhatsApp activation tokens with full warranty."
                />
              </div>

              {/* 4. Action Button (Compact) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group-compact">
                  <label>Button Text (Compact)</label>
                  <input
                    type="text"
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    placeholder="e.g. Shop Now"
                  />
                </div>
                <div className="form-group-compact">
                  <label>Button Link</label>
                  <input
                    type="text"
                    value={formCtaLink}
                    onChange={(e) => setFormCtaLink(e.target.value)}
                    placeholder="e.g. /items or /offers"
                  />
                </div>
              </div>

              {/* 5. Separate Desktop & Mobile Image Uploads */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Monitor size={14} style={{ color: '#38bdf8' }} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1' }}>
                      Desktop Artwork (16:5 ratio recommended)
                    </span>
                  </div>
                  {formDesktopImage && (
                    <div style={{ width: '100%', height: '80px', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                      <img src={formDesktopImage} alt="Desktop Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <label style={{ flex: 1, textAlign: 'center', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '5px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}>
                      <Upload size={12} style={{ marginRight: '4px', verticalAlign: '-2px' }} />
                      <span>{isUploadingDesktop ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={handleUploadDesktop} style={{ display: 'none' }} />
                    </label>
                    {formDesktopImage && (
                      <button type="button" onClick={() => setFormDesktopImage('')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '5px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Smartphone size={14} style={{ color: '#38bdf8' }} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1' }}>
                      Mobile Artwork (Touch screen ratio)
                    </span>
                  </div>
                  {formMobileImage && (
                    <div style={{ width: '100%', height: '80px', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                      <img src={formMobileImage} alt="Mobile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <label style={{ flex: 1, textAlign: 'center', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '5px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}>
                      <Upload size={12} style={{ marginRight: '4px', verticalAlign: '-2px' }} />
                      <span>{isUploadingMobile ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={handleUploadMobile} style={{ display: 'none' }} />
                    </label>
                    {formMobileImage && (
                      <button type="button" onClick={() => setFormMobileImage('')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '5px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                  Save Banner to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
