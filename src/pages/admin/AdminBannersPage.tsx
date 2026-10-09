import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  Image as ImageIcon, RefreshCw, AlertCircle, Eye, EyeOff, 
  Copy, Layers, Smartphone, Monitor, Sliders, ExternalLink, Palette,
  ArrowUp, ArrowDown, ChevronDown, ChevronUp, AlignLeft, AlignCenter, AlignRight, Layout, Info
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { HeroBanner, BannerTargetPage, BannerDisplayStyle, BannerImageMode, BannerTextPosition, BannerVerticalPlacement } from '../../types';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>(() => ottApi.getCachedBannersAdmin());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('SPECIAL OFFER');
  
  // Background & Mode
  const [formMode, setFormMode] = useState<BannerImageMode>('image-only');
  const [formSolidColor, setFormSolidColor] = useState('#0b132b');
  
  // Colors & Typography
  const [formTitleColor, setFormTitleColor] = useState('#ffffff');
  const [formSubtitleColor, setFormSubtitleColor] = useState('#cbd5e1');
  const [formBadgeColor, setFormBadgeColor] = useState('#38bdf8');
  const [formBtnBgColor, setFormBtnBgColor] = useState('#0284c7');
  const [formBtnTextColor, setFormBtnTextColor] = useState('#ffffff');
  const [formOverlayColor, setFormOverlayColor] = useState('#000000');
  const [formOverlayOpacity, setFormOverlayOpacity] = useState(0.4);

  // Positioning
  const [formTextPosition, setFormTextPosition] = useState<BannerTextPosition>('left');
  const [formContentPlacement, setFormContentPlacement] = useState<BannerVerticalPlacement>('center');
  const [formButtonPlacement, setFormButtonPlacement] = useState<BannerTextPosition>('left');

  // Buttons
  const [formCtaText, setFormCtaText] = useState('Shop Now');
  const [formCtaLink, setFormCtaLink] = useState('/items');
  const [formSecondaryCtaText, setFormSecondaryCtaText] = useState('');
  const [formSecondaryCtaLink, setFormSecondaryCtaLink] = useState('');

  // Images
  const [formDesktopImage, setFormDesktopImage] = useState('');
  const [formMobileImage, setFormMobileImage] = useState('');

  // Target & Style
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

  const handleOpenAddModal = (presetSlot: string = '01', presetStyle: BannerDisplayStyle = 'auto-slide') => {
    setEditingBanner(null);
    setFormName('');
    setFormTitle('');
    setFormSubtitle('');
    setFormDescription('');
    setFormBadgeText('SPECIAL OFFER');
    setFormMode('image-only');
    setFormSolidColor('#0b132b');
    setFormTitleColor('#ffffff');
    setFormSubtitleColor('#cbd5e1');
    setFormBadgeColor('#38bdf8');
    setFormBtnBgColor('#0284c7');
    setFormBtnTextColor('#ffffff');
    setFormOverlayColor('#000000');
    setFormOverlayOpacity(0.4);
    setFormTextPosition('left');
    setFormContentPlacement('center');
    setFormButtonPlacement('left');
    setFormCtaText('Shop Now');
    setFormCtaLink('/items');
    setFormSecondaryCtaText('');
    setFormSecondaryCtaLink('');
    setFormDesktopImage('');
    setFormMobileImage('');
    setFormTargetPage('home');
    setFormSlot(presetSlot);
    setFormStyle(presetStyle);
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
    setFormMode(b.mode || (b.solidColor ? 'solid-color' : 'image-only'));
    setFormSolidColor(b.solidColor || '#0b132b');
    setFormTitleColor(b.titleColor || '#ffffff');
    setFormSubtitleColor(b.subtitleColor || '#cbd5e1');
    setFormBadgeColor(b.badgeColor || '#38bdf8');
    setFormBtnBgColor(b.btnBgColor || '#0284c7');
    setFormBtnTextColor(b.btnTextColor || '#ffffff');
    setFormOverlayColor(b.overlayColor || '#000000');
    setFormOverlayOpacity(b.overlayOpacity ?? 0.4);
    setFormTextPosition(b.textPosition || 'left');
    setFormContentPlacement(b.contentPlacement || 'center');
    setFormButtonPlacement(b.buttonPlacement || b.textPosition || 'left');
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
      setUploadError(err.message || 'Image upload failed.');
    } finally {
      if (target === 'desktop') setIsUploadingDesktop(false);
      else setIsUploadingMobile(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() && !formName.trim() && !formDesktopImage.trim() && formMode !== 'solid-color') {
      alert('Please provide a banner name, title, or background content.');
      return;
    }

    const bannerData: HeroBanner = {
      id: editingBanner?.id || 'banner-' + Date.now(),
      name: formName.trim() || formTitle.trim() || 'Custom Banner',
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      description: formDescription.trim(),
      badgeText: formBadgeText.trim(),
      mode: formMode,
      solidColor: formSolidColor,
      titleColor: formTitleColor,
      subtitleColor: formSubtitleColor,
      badgeColor: formBadgeColor,
      btnBgColor: formBtnBgColor,
      btnTextColor: formBtnTextColor,
      overlayColor: formOverlayColor,
      overlayOpacity: formOverlayOpacity,
      textPosition: formTextPosition,
      contentPlacement: formContentPlacement,
      buttonPlacement: formButtonPlacement,
      ctaText: formCtaText.trim(),
      ctaLink: formCtaLink.trim() || '/items',
      secondaryCtaText: formSecondaryCtaText.trim() || undefined,
      secondaryCtaLink: formSecondaryCtaLink.trim() || undefined,
      desktopImage: formDesktopImage.trim() || '/hero-bg.png',
      mobileImage: formMobileImage.trim() || formDesktopImage.trim() || '/hero-mobile-1.png',
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
      slot: bannerData.slot 
    });

    showToast(`Banner "${bannerData.name}" saved successfully to database & live store!`);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteBanner = async (id: string, name?: string) => {
    if (confirm(`Are you sure you want to delete banner "${name || 'this banner'}"? This action cannot be undone.`)) {
      await ottApi.deleteBanner(id);
      await ottApi.logAudit('DELETE_BANNER', 'banners', id);
      showToast('Banner deleted.');
      await loadData();
    }
  };

  const handleToggleStatus = async (b: HeroBanner) => {
    const newStatus: 'ON' | 'OFF' = b.status === 'ON' ? 'OFF' : 'ON';
    const updated = { ...b, status: newStatus, updatedAt: Date.now() };
    await ottApi.saveBanner(updated);
    showToast(`Banner "${b.name || b.title}" is now ${newStatus === 'ON' ? 'Active' : 'Inactive'}.`);
    await loadData();
  };

  const handleMoveOrder = async (b: HeroBanner, direction: 'up' | 'down') => {
    const currentOrder = b.displayOrder || 1;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    const updated = { ...b, displayOrder: newOrder, updatedAt: Date.now() };
    await ottApi.saveBanner(updated);
    showToast(`Banner order updated to #${newOrder}`);
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

  // Grouping into Slideshow Groups vs Fixed Standalone Banners
  const slideshowGroups: Record<string, HeroBanner[]> = {};
  const fixedBanners: HeroBanner[] = [];

  filteredBanners.forEach(b => {
    if (b.style === 'auto-slide' || b.style === 'manual-slide' || b.slot === '01') {
      const groupKey = `Slot ${b.slot || '01'} Slideshow`;
      if (!slideshowGroups[groupKey]) slideshowGroups[groupKey] = [];
      slideshowGroups[groupKey].push(b);
    } else {
      fixedBanners.push(b);
    }
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <ImageIcon className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Promotional Banners & Slideshow CMS</span>
          </h1>
          <p className="admin-sub-text">
            Manage auto-sliding promo groups, add slides to existing carousels, edit solid-color & image banners, and configure artwork specs.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'grouped' ? 'list' : 'grouped')}
            className="btn-refresh-action"
            title="Toggle Grouped / List View"
          >
            <Layers size={15} />
            <span>{viewMode === 'grouped' ? 'Show All as Grid' : 'Group by Slideshow'}</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh database"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button
            onClick={() => handleOpenAddModal('01', 'auto-slide')}
            className="btn-primary-action"
          >
            <Plus size={16} />
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Dimension Recommendations Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(11, 19, 43, 0.8) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800, color: '#ffffff' }}>
              Recommended Artwork Image Dimensions
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>
              Desktop Hero: <strong>1920 × 600 px</strong> • Mobile Hero: <strong>750 × 1000 px</strong> • Desktop Promo: <strong>1200 × 400 px</strong> • Mobile Promo: <strong>750 × 900 px</strong> (Max 5MB JPG/PNG/WebP).
            </p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search banners by title, slot or page..."
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
            <option value="courses">Courses</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Statuses</option>
            <option value="ON">Active (ON) Only</option>
            <option value="OFF">Inactive (OFF) Only</option>
          </select>
        </div>
      </div>

      {/* VIEW MODE 1: Grouped Slideshow View */}
      {viewMode === 'grouped' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(slideshowGroups).map(([groupName, groupBanners]) => (
            <div
              key={groupName}
              style={{
                background: '#070d1e',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
                    AUTO-SLIDING SLIDESHOW
                  </span>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {groupName} — {groupBanners.length} Slide{groupBanners.length === 1 ? '' : 's'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAddModal(groupBanners[0]?.slot || '01', 'auto-slide')}
                  className="btn-primary-action"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Plus size={14} />
                  <span>Add Slide to this Group</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                {groupBanners.map((b, idx) => (
                  <div
                    key={b.id}
                    style={{
                      background: '#0b132b',
                      border: `1px solid ${b.status === 'ON' ? '#1e293b' : '#ef4444'}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: b.status === 'ON' ? 1 : 0.75
                    }}
                  >
                    {/* Media Preview Box */}
                    <div style={{ position: 'relative', width: '100%', height: '130px', background: b.solidColor || '#070d1e', overflow: 'hidden' }}>
                      {b.mode !== 'solid-color' && (
                        <img
                          src={getCleanImageUrl(b.desktopImage || '/hero-bg.png', b.updatedAt)}
                          alt={b.title || b.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${b.overlayOpacity ?? 0.3})` }} />

                      <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#38bdf8', color: '#000000' }}>
                          Slide #{idx + 1}
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: b.status === 'ON' ? '#16a34a' : '#ef4444', color: '#ffffff' }}>
                          {b.status}
                        </span>
                      </div>

                      <div style={{ position: 'absolute', bottom: '8px', left: '10px', right: '10px' }}>
                        <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: b.titleColor || '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.title || b.name}
                        </h3>
                      </div>
                    </div>

                    <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {b.subtitle || b.description || 'No subtitle provided.'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" onClick={() => handleMoveOrder(b, 'up')} className="btn-refresh-action" style={{ padding: '4px 6px' }} title="Move Up">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => handleMoveOrder(b, 'down')} className="btn-refresh-action" style={{ padding: '4px 6px' }} title="Move Down">
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => handleToggleStatus(b)} className="btn-refresh-action" title="Toggle On/Off">
                            {b.status === 'ON' ? <Eye size={12} color="#16a34a" /> : <EyeOff size={12} color="#ef4444" />}
                          </button>
                          <button type="button" onClick={() => handleOpenEditModal(b)} className="btn-primary-action" style={{ padding: '4px 8px', fontSize: '0.74rem' }}>
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button type="button" onClick={() => handleDeleteBanner(b.id, b.name || b.title)} className="btn-refresh-action" style={{ color: '#ef4444' }} title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Standalone Fixed Banners Section */}
          {fixedBanners.length > 0 && (
            <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
                Fixed Standalone Banners ({fixedBanners.length})
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                {fixedBanners.map((b) => (
                  <div key={b.id} style={{ background: '#0b132b', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.86rem', color: '#ffffff' }}>{b.name || b.title}</strong>
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: b.status === 'ON' ? '#16a34a' : '#ef4444', color: '#fff' }}>{b.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" onClick={() => handleToggleStatus(b)} className="btn-refresh-action" title="Toggle On/Off">
                        {b.status === 'ON' ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button type="button" onClick={() => handleOpenEditModal(b)} className="btn-primary-action" style={{ padding: '4px 8px', fontSize: '0.74rem' }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteBanner(b.id, b.name || b.title)} className="btn-refresh-action" style={{ color: '#ef4444' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW MODE 2: Standard Grid List View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredBanners.map((b) => (
            <div key={b.id} style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', padding: '14px' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#fff', margin: '0 0 6px' }}>{b.name || b.title}</h3>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 10px' }}>Slot: {b.slot} • Style: {b.style}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button type="button" onClick={() => handleToggleStatus(b)} className="btn-refresh-action">
                  {b.status === 'ON' ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button type="button" onClick={() => handleOpenEditModal(b)} className="btn-primary-action" style={{ padding: '4px 8px', fontSize: '0.74rem' }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button type="button" onClick={() => handleDeleteBanner(b.id, b.name || b.title)} className="btn-refresh-action" style={{ color: '#ef4444' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL EDITOR MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingBanner ? `Edit Banner: ${editingBanner.name || editingBanner.title}` : 'Create New Promotional Banner'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="admin-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {uploadError && (
                  <div className="admin-alert-banner error">
                    <AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Banner Mode & Type Selection */}
                <div style={{ background: '#0b132b', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <label className="admin-form-label" style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '8px' }}>
                    Banner Background Mode
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.84rem', cursor: 'pointer' }}>
                      <input type="radio" name="bannerMode" checked={formMode === 'solid-color'} onChange={() => setFormMode('solid-color')} />
                      <span>Option 1: Solid Color Background</span>
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.84rem', cursor: 'pointer' }}>
                      <input type="radio" name="bannerMode" checked={formMode !== 'solid-color'} onChange={() => setFormMode('image-only')} />
                      <span>Option 2: Image Artwork Background</span>
                    </label>
                  </div>
                </div>

                {/* Internal Name & Heading */}
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Internal Banner Name *</label>
                    <input type="text" className="admin-form-input" placeholder="e.g. Diwali Hero Banner Slide 4" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Main Heading / Title</label>
                    <input type="text" className="admin-form-input" placeholder="e.g. Stream 4K Movies & Sports" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                  </div>
                </div>

                {/* Subheading & Description */}
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Subheading</label>
                    <input type="text" className="admin-form-input" placeholder="e.g. Private PIN activation" value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Badge Pill Text</label>
                    <input type="text" className="admin-form-input" placeholder="e.g. 70% OFF" value={formBadgeText} onChange={(e) => setFormBadgeText(e.target.value)} />
                  </div>
                </div>

                {/* Button Text & Links */}
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Primary Button Text</label>
                    <input type="text" className="admin-form-input" value={formCtaText} onChange={(e) => setFormCtaText(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Primary Button URL</label>
                    <input type="text" className="admin-form-input" value={formCtaLink} onChange={(e) => setFormCtaLink(e.target.value)} />
                  </div>
                </div>

                {/* Placement & Alignment Settings */}
                <div className="admin-form-row-3">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Horizontal Text Alignment</label>
                    <select className="admin-form-select" value={formTextPosition} onChange={(e) => setFormTextPosition(e.target.value as any)}>
                      <option value="left">Left Aligned</option>
                      <option value="center">Centered</option>
                      <option value="right">Right Aligned</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Vertical Content Placement</label>
                    <select className="admin-form-select" value={formContentPlacement} onChange={(e) => setFormContentPlacement(e.target.value as any)}>
                      <option value="top">Top</option>
                      <option value="center">Middle / Center</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Banner Type</label>
                    <select className="admin-form-select" value={formStyle} onChange={(e) => setFormStyle(e.target.value as any)}>
                      <option value="auto-slide">Auto-Sliding Slideshow</option>
                      <option value="fixed">Fixed Standalone Banner</option>
                    </select>
                  </div>
                </div>

                {/* Solid Color Customizer */}
                {formMode === 'solid-color' ? (
                  <div style={{ background: '#0b132b', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                    <label className="admin-form-label">Solid Background Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="color" value={formSolidColor} onChange={(e) => setFormSolidColor(e.target.value)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
                      <input type="text" className="admin-form-input" value={formSolidColor} onChange={(e) => setFormSolidColor(e.target.value)} />
                    </div>
                  </div>
                ) : (
                  /* Image Uploads with Dimensions Displayed */
                  <div className="admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Desktop Image (Recommended 1920×600 px)</label>
                      <input type="text" className="admin-form-input" placeholder="Image URL or upload" value={formDesktopImage} onChange={(e) => setFormDesktopImage(e.target.value)} />
                      <input type="file" id="modal-desktop-file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'desktop')} />
                      <label htmlFor="modal-desktop-file" className="btn-refresh-action" style={{ cursor: 'pointer', marginTop: '6px', display: 'inline-flex', gap: '6px' }}>
                        <Upload size={13} /> {isUploadingDesktop ? 'Uploading...' : 'Upload Desktop Artwork'}
                      </label>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Mobile Image (Recommended 750×1000 px)</label>
                      <input type="text" className="admin-form-input" placeholder="Mobile image URL" value={formMobileImage} onChange={(e) => setFormMobileImage(e.target.value)} />
                      <input type="file" id="modal-mobile-file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'mobile')} />
                      <label htmlFor="modal-mobile-file" className="btn-refresh-action" style={{ cursor: 'pointer', marginTop: '6px', display: 'inline-flex', gap: '6px' }}>
                        <Upload size={13} /> {isUploadingMobile ? 'Uploading...' : 'Upload Mobile Artwork'}
                      </label>
                    </div>
                  </div>
                )}

                {/* Target Page & Slot */}
                <div className="admin-form-row-3">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Target Page</label>
                    <select className="admin-form-select" value={formTargetPage} onChange={(e) => setFormTargetPage(e.target.value as any)}>
                      <option value="home">Home Page</option>
                      <option value="items">Items / Subscriptions</option>
                      <option value="offers">Special Offers</option>
                      <option value="all">All Pages</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Slideshow Slot / Position</label>
                    <input type="text" className="admin-form-input" placeholder="e.g. 01" value={formSlot} onChange={(e) => setFormSlot(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Publication Status</label>
                    <select className="admin-form-select" value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
                      <option value="ON">Active (ON - Published)</option>
                      <option value="OFF">Inactive (OFF - Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Accessible Footer Buttons */}
              <div className="admin-modal-footer" style={{ borderTop: '1px solid #1e293b', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-refresh-action">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action" style={{ padding: '8px 24px' }}>
                  <Check size={16} />
                  <span>Save Changes</span>
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
