import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  Image as ImageIcon, RefreshCw, AlertCircle, Eye, EyeOff, Palette
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { HeroBanner } from '../../types';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>(() => ottApi.getCachedBannersAdmin());
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('');
  const [formTitleColor, setFormTitleColor] = useState('#ffffff');
  const [formSubtitleColor, setFormSubtitleColor] = useState('#cbd5e1');
  const [formBadgeColor, setFormBadgeColor] = useState('#38bdf8');
  const [formCtaText, setFormCtaText] = useState('Shop Now');
  const [formCtaLink, setFormCtaLink] = useState('/items');
  const [formDesktopImage, setFormDesktopImage] = useState('');
  const [formMobileImage, setFormMobileImage] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formStatus, setFormStatus] = useState<'ON' | 'OFF'>('ON');

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
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

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormBadgeText('SPECIAL OFFER');
    setFormTitleColor('#ffffff');
    setFormSubtitleColor('#cbd5e1');
    setFormBadgeColor('#38bdf8');
    setFormCtaText('Shop Now');
    setFormCtaLink('/items');
    setFormDesktopImage('');
    setFormMobileImage('');
    setFormDisplayOrder(String(banners.length + 1));
    setFormStatus('ON');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: HeroBanner) => {
    setEditingBanner(b);
    setFormTitle(b.title || '');
    setFormSubtitle(b.subtitle || '');
    setFormBadgeText(b.badgeText || '');
    setFormTitleColor(b.titleColor || '#ffffff');
    setFormSubtitleColor(b.subtitleColor || '#cbd5e1');
    setFormBadgeColor(b.badgeColor || '#38bdf8');
    setFormCtaText(b.ctaText || 'Shop Now');
    setFormCtaLink(b.ctaLink || '/items');
    setFormDesktopImage(b.desktopImage || '');
    setFormMobileImage(b.mobileImage || '');
    setFormDisplayOrder(String(b.displayOrder || 1));
    setFormStatus(b.status || 'ON');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const res = await uploadService.uploadImage(file, 'banners');
    setIsUploading(false);

    if (res.success && res.url) {
      setFormDesktopImage(res.url);
      if (!formMobileImage) setFormMobileImage(res.url);
    } else {
      setUploadError(res.error || 'Failed to upload image. Please try again.');
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesktopImage.trim() && !formTitle.trim()) {
      alert('Either Banner Title or Desktop Image is required');
      return;
    }

    const bannerData: HeroBanner = {
      id: editingBanner?.id || 'bnr-' + Date.now(),
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      badgeText: formBadgeText.trim(),
      titleColor: formTitleColor,
      subtitleColor: formSubtitleColor,
      badgeColor: formBadgeColor,
      ctaText: formCtaText.trim() || 'Shop Now',
      ctaLink: formCtaLink.trim() || '/items',
      desktopImage: formDesktopImage.trim() || '/hero-bg.png',
      mobileImage: formMobileImage.trim() || formDesktopImage.trim() || '/hero-mobile-1.png',
      mode: 'image-only',
      textPosition: 'left',
      displayOrder: Number(formDisplayOrder) || 1,
      status: formStatus,
      updatedAt: Date.now()
    };

    const existingIndex = banners.findIndex(b => b.id === bannerData.id);
    let updated: HeroBanner[];
    if (existingIndex >= 0) {
      updated = [...banners];
      updated[existingIndex] = bannerData;
    } else {
      updated = [...banners, bannerData];
    }

    setBanners(updated);
    await ottApi.saveBanners(updated);
    await ottApi.logAudit(editingBanner ? 'UPDATE_BANNER' : 'CREATE_BANNER', 'banners', bannerData.id, { title: bannerData.title });

    setSaveSuccessMsg(`Banner "${bannerData.title || 'Promotional Banner'}" saved successfully to Supabase! Live storefront updated.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this banner?')) {
      setBanners(prev => prev.filter(b => b.id !== id));
      await ottApi.deleteBanner(id);
      await ottApi.logAudit('DELETE_BANNER', 'banners', id);
      await loadData();
    }
  };

  const handleToggleStatus = async (b: HeroBanner) => {
    const newStatus = b.status === 'ON' ? 'OFF' : 'ON';
    const updated = banners.map(item => item.id === b.id ? { ...item, status: newStatus as any } : item);
    setBanners(updated);
    await ottApi.saveBanners(updated);
    await ottApi.logAudit('TOGGLE_BANNER_STATUS', 'banners', b.id, { status: newStatus });
    await loadData();
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <ImageIcon className="admin-heading-icon" />
            <span>Promotional Banners</span>
          </h1>
          <p className="admin-sub-text">
            Manage top carousel banners, promo advertisements, text colors, and sale announcements.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh database"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary-action"
          >
            <Plus size={16} />
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Banners Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {loading && banners.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 10px', color: '#0284c7' }} />
            Loading banners from Supabase...
          </div>
        ) : banners.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            No promotional banners found. Click &quot;Add Banner&quot; above to create one.
          </div>
        ) : (
          banners.map((b) => (
            <div 
              key={b.id}
              style={{
                background: '#070d1e',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              {/* Image Container */}
              <div style={{ position: 'relative', width: '100%', height: '160px', background: '#020617', overflow: 'hidden' }}>
                <img
                  src={getCleanImageUrl(b.desktopImage, b.updatedAt)}
                  alt={b.title || 'Banner'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/hero-bg.png';
                  }}
                />
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                    #{b.displayOrder || 1}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(b)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      background: b.status === 'ON' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      color: b.status === 'ON' ? '#34d399' : '#f87171'
                    }}
                  >
                    {b.status === 'ON' ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {b.badgeText && (
                  <span style={{ display: 'inline-block', width: 'fit-content', padding: '2px 8px', background: 'rgba(56,189,248,0.15)', color: b.badgeColor || '#38bdf8', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    {b.badgeText}
                  </span>
                )}
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: b.titleColor || '#ffffff', margin: 0, lineHeight: 1.3 }}>
                  {b.title || 'Image-Only Banner'}
                </h3>
                {b.subtitle && (
                  <p style={{ fontSize: '0.8rem', color: b.subtitleColor || '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                    {b.subtitle}
                  </p>
                )}
                <div style={{ marginTop: 'auto', paddingTop: '10px', fontSize: '0.76rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b' }}>
                  <span>Button: <strong>{b.ctaText}</strong></span>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{b.ctaLink}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ padding: '12px 16px', background: '#040814', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => handleOpenEditModal(b)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#1e293b', color: '#cbd5e1', borderRadius: '8px', border: '1px solid #334155', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteBanner(b.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={20} style={{ color: '#0284c7' }} />
                <span>{editingBanner ? 'Edit Banner Details' : 'Add New Promotional Banner'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close Modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="admin-form-grid">
              <div className="admin-form-group admin-form-full">
                <label>Banner Title</label>
                <input
                  type="text"
                  placeholder="e.g. MEGA CRICKET LEAGUE PASS"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="admin-form-group admin-form-full">
                <label>Subtitle / Highlight Note</label>
                <input
                  type="text"
                  placeholder="Watch live matches in 4K with instant private credentials"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                />
              </div>

              {/* Text Color Controls */}
              <div className="admin-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Palette size={14} style={{ color: '#38bdf8' }} />
                  <span>Title Text Color</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={formTitleColor}
                    onChange={(e) => setFormTitleColor(e.target.value)}
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', background: 'transparent' }}
                  />
                  <input
                    type="text"
                    value={formTitleColor}
                    onChange={(e) => setFormTitleColor(e.target.value)}
                    style={{ flex: 1, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Palette size={14} style={{ color: '#38bdf8' }} />
                  <span>Subtitle Text Color</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={formSubtitleColor}
                    onChange={(e) => setFormSubtitleColor(e.target.value)}
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', background: 'transparent' }}
                  />
                  <input
                    type="text"
                    value={formSubtitleColor}
                    onChange={(e) => setFormSubtitleColor(e.target.value)}
                    style={{ flex: 1, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Badge Tag Text</label>
                <input
                  type="text"
                  placeholder="e.g. FLASH SALE 80% OFF"
                  value={formBadgeText}
                  onChange={(e) => setFormBadgeText(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Badge Text Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={formBadgeColor}
                    onChange={(e) => setFormBadgeColor(e.target.value)}
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', background: 'transparent' }}
                  />
                  <input
                    type="text"
                    value={formBadgeColor}
                    onChange={(e) => setFormBadgeColor(e.target.value)}
                    style={{ flex: 1, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Button Label</label>
                <input
                  type="text"
                  value={formCtaText}
                  onChange={(e) => setFormCtaText(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Button Link URL</label>
                <input
                  type="text"
                  value={formCtaLink}
                  onChange={(e) => setFormCtaLink(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Display Sort Order</label>
                <input
                  type="number"
                  min="1"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Display Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'ON' | 'OFF')}
                >
                  <option value="ON">Active (Visible)</option>
                  <option value="OFF">Disabled</option>
                </select>
              </div>

              {/* Desktop Image */}
              <div className="admin-form-group admin-form-full">
                <label>Desktop Banner Graphic *</label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {formDesktopImage && (
                    <img
                      src={formDesktopImage}
                      alt="Preview"
                      style={{ width: '100px', height: '54px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Paste image URL or upload image file..."
                      value={formDesktopImage}
                      onChange={(e) => setFormDesktopImage(e.target.value)}
                    />
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1e293b', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer', width: 'fit-content' }}>
                      <Upload size={14} />
                      <span>{isUploading ? 'Uploading to Cloudinary...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
                {uploadError && (
                  <span style={{ fontSize: '0.78rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <AlertCircle size={14} /> {uploadError}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="admin-modal-actions admin-form-full">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '10px 18px', borderRadius: '10px', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn-primary-action"
                  style={{ padding: '10px 22px' }}
                >
                  <Check size={16} />
                  <span>Save Banner to Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
