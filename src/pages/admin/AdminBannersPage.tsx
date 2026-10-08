import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  Image as ImageIcon, RefreshCw, AlertCircle, Eye, EyeOff, 
  Copy, Layers, Smartphone, Monitor, Sliders, ExternalLink, Palette 
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
    setFormName(b.name || b.title);
    setFormTitle(b.title || '');
    setFormSubtitle(b.subtitle || '');
    setFormDescription(b.description || '');
    setFormBadgeText(b.badgeText || 'SPECIAL OFFER');
    setFormTitleColor(b.titleColor || '#ffffff');
    setFormSubtitleColor(b.subtitleColor || '#cbd5e1');
    setFormBadgeColor(b.badgeColor || '#38bdf8');
    setFormCtaText(b.ctaText || 'Shop Now');
    setFormCtaLink(b.ctaLink || '/items');
    setFormSecondaryCtaText(b.secondaryCtaText || '');
    setFormSecondaryCtaLink(b.secondaryCtaLink || '');
    setFormDesktopImage(b.desktopImage || '');
    setFormMobileImage(b.mobileImage || '');
    setFormTargetPage((b.page || 'home').toLowerCase() as any);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'desktop') setIsUploadingDesktop(true);
    else setIsUploadingMobile(true);
    setUploadError(null);

    try {
      const res = await uploadService.uploadImage(file, 'banners');
      if (res.success && res.url) {
        if (target === 'desktop') {
          setFormDesktopImage(res.url);
        } else {
          setFormMobileImage(res.url);
        }
      } else {
        setUploadError(res.error || 'Image upload failed.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed. Please use valid JPG/PNG/WebP.');
    } finally {
      if (target === 'desktop') setIsUploadingDesktop(false);
      else setIsUploadingMobile(false);
    }
  };

  const handleDuplicate = async (b: HeroBanner) => {
    const duplicated: HeroBanner = {
      ...b,
      id: `banner-${Date.now()}`,
      name: `${b.name || b.title} (Copy)`,
      title: `${b.title} (Copy)`,
      displayOrder: (b.displayOrder || 0) + 1,
      status: 'ON',
      updatedAt: Date.now()
    };
    await ottApi.saveBanner(duplicated);
    await ottApi.logAudit('DUPLICATE_BANNER', 'banners', duplicated.id, { source: b.id });
    showToast(`Banner duplicated successfully as "${duplicated.name}"!`);
    await loadData();
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() && !formName.trim() && !formDesktopImage.trim()) {
      alert('Please provide a banner name or upload an artwork.');
      return;
    }

    const bannerData: HeroBanner = {
      id: editingBanner?.id || 'banner-' + Date.now(),
      name: formName.trim() || formTitle.trim(),
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      description: formDescription.trim(),
      badgeText: formBadgeText.trim(),
      titleColor: formTitleColor,
      subtitleColor: formSubtitleColor,
      badgeColor: formBadgeColor,
      ctaText: formCtaText.trim(),
      ctaLink: formCtaLink.trim() || '/items',
      secondaryCtaText: formSecondaryCtaText.trim() || undefined,
      secondaryCtaLink: formSecondaryCtaLink.trim() || undefined,
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

  const filteredBanners = (banners || []).filter(b => {
    if (!b) return false;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = 
      (b.name || '').toLowerCase().includes(q) ||
      (b.title || '').toLowerCase().includes(q) ||
      (b.page || '').toLowerCase().includes(q) ||
      (b.slot || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (pageFilter !== 'all' && (b.page || 'home') !== pageFilter) return false;
    if (statusFilter !== 'all' && (b.status || 'ON') !== statusFilter) return false;
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <ImageIcon className="admin-heading-icon" style={{ color: '#0284c7' }} />
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
              background: '#ffffff',
              border: `1px solid ${b.status === 'ON' ? 'var(--admin-border)' : '#fecaca'}`,
              borderRadius: 'var(--admin-radius)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--admin-shadow)',
              opacity: b.status === 'ON' ? 1 : 0.75
            }}
          >
            {/* Media Preview Box */}
            <div style={{ position: 'relative', width: '100%', height: '140px', background: '#0b132b', overflow: 'hidden' }}>
              <img
                src={getCleanImageUrl(b.desktopImage || '/hero-bg.png', b.updatedAt)}
                alt={b.title || b.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(15,23,42,0.85) 100%)' }} />

              {/* Status & Page Badge */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: b.status === 'ON' ? '#16a34a' : '#64748b',
                  color: '#ffffff',
                  textTransform: 'uppercase'
                }}>
                  {b.status === 'ON' ? 'Active' : 'Inactive'}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(2, 132, 199, 0.9)',
                  color: '#ffffff'
                }}>
                  Page: {(b.page || 'home').toUpperCase()} • Slot {b.slot || '01'}
                </span>
              </div>

              <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: b.titleColor || '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.title || b.name}
                </h3>
              </div>
            </div>

            {/* Info Body */}
            <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {b.subtitle && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {b.subtitle}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                  <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                    Style: <strong>{b.style || 'auto-slide'}</strong>
                  </span>
                  <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                    Order: #{b.displayOrder}
                  </span>
                  {b.ctaText && (
                    <span style={{ background: 'var(--admin-primary-light)', color: 'var(--admin-primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      CTA: {b.ctaText}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--admin-border-light)' }}>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(b)}
                  className={`admin-badge ${b.status === 'ON' ? 'active' : 'inactive'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {b.status === 'ON' ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{b.status === 'ON' ? 'Active' : 'Inactive'}</span>
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(b)}
                    title="Duplicate Banner"
                    className="btn-refresh-action"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(b)}
                    className="btn-primary-action"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b.id, b.title || b.name)}
                    className="btn-refresh-action"
                    style={{ color: 'var(--admin-danger)' }}
                    title="Delete banner"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '720px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingBanner ? `Edit Banner (${editingBanner.name || editingBanner.title})` : 'Create New Promotional Banner'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="admin-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner}>
              <div className="admin-modal-body">
                {uploadError && (
                  <div className="admin-alert-banner error">
                    <AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Banner Name & Title */}
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Internal Banner Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Diwali Mega Sale Hero Banner"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Overlay Title (Optional)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. FLAT 70% OFF ON ALL PLANS"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </div>
                </div>

                {/* Subtitle & Badge */}
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Overlay Subtitle</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Instant WhatsApp Credentials Delivery"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Badge Pill Text</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. FESTIVE DEAL"
                      value={formBadgeText}
                      onChange={(e) => setFormBadgeText(e.target.value)}
                    />
                  </div>
                </div>

                {/* Color Pickers (Requirement 9: Restore banner text color selection with HEX input & preview) */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--admin-radius-sm)', border: '1px solid var(--admin-border)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Palette size={16} color="#0284c7" />
                    <strong style={{ fontSize: '0.82rem', color: 'var(--admin-text-main)' }}>Typography & Color Customizer</strong>
                  </div>

                  <div className="admin-form-row-3">
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Title Text Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="color"
                          value={formTitleColor}
                          onChange={(e) => setFormTitleColor(e.target.value)}
                          style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          className="admin-form-input"
                          value={formTitleColor}
                          onChange={(e) => setFormTitleColor(e.target.value)}
                          style={{ fontSize: '0.76rem', padding: '6px 8px' }}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Subtitle Text Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="color"
                          value={formSubtitleColor}
                          onChange={(e) => setFormSubtitleColor(e.target.value)}
                          style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          className="admin-form-input"
                          value={formSubtitleColor}
                          onChange={(e) => setFormSubtitleColor(e.target.value)}
                          style={{ fontSize: '0.76rem', padding: '6px 8px' }}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Badge Pill Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="color"
                          value={formBadgeColor}
                          onChange={(e) => setFormBadgeColor(e.target.value)}
                          style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          className="admin-form-input"
                          value={formBadgeColor}
                          onChange={(e) => setFormBadgeColor(e.target.value)}
                          style={{ fontSize: '0.76rem', padding: '6px 8px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images (Requirement 12: Desktop & Mobile Separate Images) */}
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Monitor size={14} />
                      <span>Desktop Artwork Image URL</span>
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. /hero-bg.png or Cloudinary URL"
                      value={formDesktopImage}
                      onChange={(e) => setFormDesktopImage(e.target.value)}
                    />
                    <div style={{ marginTop: '6px' }}>
                      <input
                        type="file"
                        id="desktop-banner-file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageUpload(e, 'desktop')}
                      />
                      <label
                        htmlFor="desktop-banner-file"
                        className="btn-refresh-action"
                        style={{ cursor: 'pointer', display: 'inline-flex', gap: '6px', fontSize: '0.76rem', padding: '4px 10px' }}
                      >
                        <Upload size={13} />
                        <span>{isUploadingDesktop ? 'Uploading...' : 'Upload Desktop Artwork'}</span>
                      </label>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={14} />
                      <span>Mobile Artwork Image URL</span>
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. /hero-mobile-1.png (optional)"
                      value={formMobileImage}
                      onChange={(e) => setFormMobileImage(e.target.value)}
                    />
                    <div style={{ marginTop: '6px' }}>
                      <input
                        type="file"
                        id="mobile-banner-file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageUpload(e, 'mobile')}
                      />
                      <label
                        htmlFor="mobile-banner-file"
                        className="btn-refresh-action"
                        style={{ cursor: 'pointer', display: 'inline-flex', gap: '6px', fontSize: '0.76rem', padding: '4px 10px' }}
                      >
                        <Upload size={13} />
                        <span>{isUploadingMobile ? 'Uploading...' : 'Upload Mobile Artwork'}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Primary Button Text</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formCtaText}
                      onChange={(e) => setFormCtaText(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Primary Button Link</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formCtaLink}
                      onChange={(e) => setFormCtaLink(e.target.value)}
                    />
                  </div>
                </div>

                {/* Page Mapping & Slot (Requirement 10 & 11) */}
                <div className="admin-form-row-3">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Target Page</label>
                    <select
                      className="admin-form-select"
                      value={formTargetPage}
                      onChange={(e) => setFormTargetPage(e.target.value as any)}
                    >
                      <option value="home">Home Page</option>
                      <option value="items">Items / Subscriptions</option>
                      <option value="offers">Special Offers</option>
                      <option value="courses">Courses</option>
                      <option value="all">All Pages</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Banner Slot / Position</label>
                    <select
                      className="admin-form-select"
                      value={formSlot}
                      onChange={(e) => setFormSlot(e.target.value)}
                    >
                      <option value="01">Slot 01 (Hero Carousel)</option>
                      <option value="02">Slot 02 (Middle Promo)</option>
                      <option value="03">Slot 03 (Bottom Strip)</option>
                      <option value="top">Top Header Banner</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Display Style Mode</label>
                    <select
                      className="admin-form-select"
                      value={formStyle}
                      onChange={(e) => setFormStyle(e.target.value as any)}
                    >
                      <option value="auto-slide">Auto Slide</option>
                      <option value="fixed">Fixed Single</option>
                      <option value="manual-slide">Manual Slide</option>
                    </select>
                  </div>
                </div>

                {/* Order & Status */}
                <div className="admin-form-row-3">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      className="admin-form-input"
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Auto-Slide Interval (Sec)</label>
                    <input
                      type="number"
                      min="2"
                      max="60"
                      className="admin-form-input"
                      value={formInterval}
                      onChange={(e) => setFormInterval(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Status</label>
                    <select
                      className="admin-form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                    >
                      <option value="ON">Active (ON - Live on Website)</option>
                      <option value="OFF">Inactive (OFF - Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-refresh-action"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                >
                  <Check size={16} />
                  <span>{editingBanner ? 'Update Banner' : 'Save Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBannersPage;
