import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  Image as ImageIcon, RefreshCw, AlertCircle, Eye, EyeOff, 
  Copy, Layers, Smartphone, Monitor, Sliders, ExternalLink, Palette,
  ArrowUp, ArrowDown, ChevronDown, ChevronUp, AlignLeft, AlignCenter, AlignRight, Layout, Info,
  Sparkles, FolderPlus, Grid, Play, Link as LinkIcon
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { 
  HeroBanner, BannerGroup, BannerButton, BannerTargetPage, 
  BannerDisplayStyle, BannerImageMode, BannerTextPosition, BannerVerticalPlacement 
} from '../../types';

const COLOR_PRESETS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Sky Cyan', hex: '#38bdf8' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Netflix Red', hex: '#e50914' },
  { name: 'Indigo Purple', hex: '#6366f1' },
  { name: 'Dark Navy', hex: '#0b132b' },
  { name: 'Slate Gray', hex: '#94a3b8' }
];

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>(() => ottApi.getCachedBannersAdmin());
  const [bannerGroups, setBannerGroups] = useState<BannerGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  // Creation Destination Dialog Modal
  const [isGroupChoiceModalOpen, setIsGroupChoiceModalOpen] = useState(false);
  const [selectedCreationOption, setSelectedCreationOption] = useState<'existing' | 'new'>('existing');
  const [chosenGroupSlot, setChosenGroupSlot] = useState('01');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSlot, setNewGroupSlot] = useState('');
  const [newGroupPage, setNewGroupPage] = useState<BannerTargetPage>('home');
  const [newGroupStyle, setNewGroupStyle] = useState<BannerDisplayStyle>('auto-slide');

  // Banner Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formGroupName, setFormGroupName] = useState('Hero Main Slideshow');
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
  const [formDescriptionColor, setFormDescriptionColor] = useState('#94a3b8');
  const [formBtnBgColor, setFormBtnBgColor] = useState('#0284c7');
  const [formBtnTextColor, setFormBtnTextColor] = useState('#ffffff');
  const [formBtnBorderColor, setFormBtnBorderColor] = useState('#0284c7');
  const [formOverlayColor, setFormOverlayColor] = useState('#000000');
  const [formOverlayOpacity, setFormOverlayOpacity] = useState(0.4);

  // Positioning
  const [formTextPosition, setFormTextPosition] = useState<BannerTextPosition>('left');
  const [formContentPlacement, setFormContentPlacement] = useState<BannerVerticalPlacement>('center');
  const [formButtonPlacement, setFormButtonPlacement] = useState<BannerTextPosition>('left');

  // Primary & Secondary Buttons
  const [formCtaText, setFormCtaText] = useState('Shop Now');
  const [formCtaLink, setFormCtaLink] = useState('/items');
  const [formSecondaryCtaText, setFormSecondaryCtaText] = useState('');
  const [formSecondaryCtaLink, setFormSecondaryCtaLink] = useState('');
  
  // Multi-Buttons List
  const [formButtons, setFormButtons] = useState<BannerButton[]>([]);
  const [newBtnLabel, setNewBtnLabel] = useState('');
  const [newBtnLink, setNewBtnLink] = useState('');
  const [newBtnStyle, setNewBtnStyle] = useState<'primary' | 'secondary' | 'outline' | 'ghost'>('primary');
  const [newBtnBgColor, setNewBtnBgColor] = useState('#0284c7');
  const [newBtnTextColor, setNewBtnTextColor] = useState('#ffffff');
  const [newBtnBorderColor, setNewBtnBorderColor] = useState('#0284c7');

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
      const [bns, groups] = await Promise.all([
        ottApi.getAllBannersAdmin(),
        ottApi.getBannerGroups()
      ]);
      setBanners(bns);
      setBannerGroups(groups);
      if (groups.length > 0 && !chosenGroupSlot) {
        setChosenGroupSlot(groups[0].slot);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Step 1: Click "Create Banner" -> Open Group Assignment Choice
  const handleOpenCreateBannerChoice = () => {
    setSelectedCreationOption('existing');
    setChosenGroupSlot(bannerGroups[0]?.slot || '01');
    setNewGroupName('');
    setNewGroupSlot(`group-${Date.now().toString().slice(-4)}`);
    setNewGroupPage('home');
    setNewGroupStyle('auto-slide');
    setIsGroupChoiceModalOpen(true);
  };

  // Step 2: Confirm destination choice and proceed to banner editor
  const handleProceedToBannerEditor = async () => {
    setIsGroupChoiceModalOpen(false);
    let targetSlot = '01';
    let targetGroupName = 'Hero Main Slideshow';
    let targetPage: BannerTargetPage = 'home';
    let targetStyle: BannerDisplayStyle = 'auto-slide';

    if (selectedCreationOption === 'existing') {
      targetSlot = chosenGroupSlot;
      const foundGroup = bannerGroups.find(g => g.slot === chosenGroupSlot);
      if (foundGroup) {
        targetGroupName = foundGroup.name;
        targetPage = foundGroup.page;
        targetStyle = foundGroup.style;
      }
    } else {
      // Create new group
      targetSlot = newGroupSlot.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-') || `group-${Date.now()}`;
      targetGroupName = newGroupName.trim() || `Banner Group (${targetSlot})`;
      targetPage = newGroupPage;
      targetStyle = newGroupStyle;

      const newGroup: BannerGroup = {
        id: targetSlot,
        name: targetGroupName,
        slot: targetSlot,
        page: targetPage,
        style: targetStyle,
        autoplay: true,
        interval: 5,
        status: 'ON',
        bannerCount: 0
      };
      await ottApi.saveBannerGroup(newGroup);
    }

    // Open Add Modal with chosen group
    setEditingBanner(null);
    setFormName('');
    setFormGroupName(targetGroupName);
    setFormTitle('');
    setFormSubtitle('');
    setFormDescription('');
    setFormBadgeText('SPECIAL OFFER');
    setFormMode('image-only');
    setFormSolidColor('#0b132b');
    setFormTitleColor('#ffffff');
    setFormSubtitleColor('#cbd5e1');
    setFormBadgeColor('#38bdf8');
    setFormDescriptionColor('#94a3b8');
    setFormBtnBgColor('#0284c7');
    setFormBtnTextColor('#ffffff');
    setFormBtnBorderColor('#0284c7');
    setFormOverlayColor('#000000');
    setFormOverlayOpacity(0.4);
    setFormTextPosition('left');
    setFormContentPlacement('center');
    setFormButtonPlacement('left');
    setFormCtaText('Shop Now');
    setFormCtaLink('/items');
    setFormSecondaryCtaText('');
    setFormSecondaryCtaLink('');
    setFormButtons([]);
    setFormDesktopImage('');
    setFormMobileImage('');
    setFormTargetPage(targetPage);
    setFormSlot(targetSlot);
    setFormStyle(targetStyle);
    setFormAutoplay(true);
    setFormInterval('5');
    
    // Order inside chosen group
    const existingInGroup = banners.filter(b => b.slot === targetSlot);
    setFormDisplayOrder(String(existingInGroup.length + 1));
    setFormStatus('ON');
    setFormShowText(true);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: HeroBanner) => {
    setEditingBanner(b);
    setFormName(b.name || b.title);
    setFormGroupName(b.groupName || (b.slot === '01' ? 'Hero Main Slideshow' : `Group ${b.slot}`));
    setFormTitle(b.title || '');
    setFormSubtitle(b.subtitle || '');
    setFormDescription(b.description || '');
    setFormBadgeText(b.badgeText || 'SPECIAL OFFER');
    setFormMode(b.mode || (b.solidColor ? 'solid-color' : 'image-only'));
    setFormSolidColor(b.solidColor || '#0b132b');
    setFormTitleColor(b.titleColor || '#ffffff');
    setFormSubtitleColor(b.subtitleColor || '#cbd5e1');
    setFormBadgeColor(b.badgeColor || '#38bdf8');
    setFormDescriptionColor(b.descriptionColor || '#94a3b8');
    setFormBtnBgColor(b.btnBgColor || '#0284c7');
    setFormBtnTextColor(b.btnTextColor || '#ffffff');
    setFormBtnBorderColor(b.btnBorderColor || b.btnBgColor || '#0284c7');
    setFormOverlayColor(b.overlayColor || '#000000');
    setFormOverlayOpacity(b.overlayOpacity ?? 0.4);
    setFormTextPosition(b.textPosition || 'left');
    setFormContentPlacement(b.contentPlacement || 'center');
    setFormButtonPlacement(b.buttonPlacement || b.textPosition || 'left');
    setFormCtaText(b.ctaText || 'Shop Now');
    setFormCtaLink(b.ctaLink || '/items');
    setFormSecondaryCtaText(b.secondaryCtaText || '');
    setFormSecondaryCtaLink(b.secondaryCtaLink || '');
    setFormButtons(b.buttons || []);
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

  const handleAddCustomButton = () => {
    if (!newBtnLabel.trim() || !newBtnLink.trim()) {
      alert('Button label and link destination are required.');
      return;
    }

    const newBtn: BannerButton = {
      id: 'btn-' + Date.now(),
      label: newBtnLabel.trim(),
      link: newBtnLink.trim(),
      style: newBtnStyle,
      bgColor: newBtnBgColor,
      textColor: newBtnTextColor,
      borderColor: newBtnBorderColor,
      placement: formButtonPlacement
    };

    setFormButtons([...formButtons, newBtn]);
    setNewBtnLabel('');
    setNewBtnLink('');
  };

  const handleRemoveCustomButton = (id: string) => {
    setFormButtons(formButtons.filter(b => b.id !== id));
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
      alert('Please provide a banner name, title, or image.');
      return;
    }

    const bannerData: HeroBanner = {
      id: editingBanner?.id || 'banner-' + Date.now(),
      name: formName.trim() || formTitle.trim() || 'Custom Banner',
      groupName: formGroupName.trim() || (formSlot === '01' ? 'Hero Main Slideshow' : `Group ${formSlot}`),
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      description: formDescription.trim(),
      badgeText: formBadgeText.trim(),
      mode: formMode,
      solidColor: formSolidColor,
      titleColor: formTitleColor,
      subtitleColor: formSubtitleColor,
      badgeColor: formBadgeColor,
      descriptionColor: formDescriptionColor,
      btnBgColor: formBtnBgColor,
      btnTextColor: formBtnTextColor,
      btnBorderColor: formBtnBorderColor,
      overlayColor: formOverlayColor,
      overlayOpacity: formOverlayOpacity,
      textPosition: formTextPosition,
      contentPlacement: formContentPlacement,
      buttonPlacement: formButtonPlacement,
      ctaText: formCtaText.trim(),
      ctaLink: formCtaLink.trim() || '/items',
      secondaryCtaText: formSecondaryCtaText.trim() || undefined,
      secondaryCtaLink: formSecondaryCtaLink.trim() || undefined,
      buttons: formButtons.length > 0 ? formButtons : undefined,
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

    showToast(`Banner "${bannerData.name}" saved to Group "${bannerData.groupName}" & synchronized live!`);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteBanner = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete banner "${name}"?`)) {
      await ottApi.deleteBanner(id);
      await ottApi.logAudit('DELETE_BANNER', 'banners', id, { name });
      showToast('Banner deleted.');
      await loadData();
    }
  };

  const handleDuplicateBanner = async (b: HeroBanner) => {
    const duplicated: HeroBanner = {
      ...b,
      id: 'banner-' + Date.now(),
      name: `${b.name || b.title} (Copy)`,
      title: `${b.title} (Copy)`,
      displayOrder: (b.displayOrder || 1) + 1,
      updatedAt: Date.now()
    };
    await ottApi.saveBanner(duplicated);
    showToast(`Banner "${duplicated.name}" duplicated.`);
    await loadData();
  };

  const handleToggleStatus = async (b: HeroBanner) => {
    const nextStatus: 'ON' | 'OFF' = b.status === 'ON' ? 'OFF' : 'ON';
    const updated = { ...b, status: nextStatus, updatedAt: Date.now() };
    await ottApi.saveBanner(updated);
    showToast(`Banner is now ${nextStatus === 'ON' ? 'ACTIVE (Live)' : 'INACTIVE (Hidden)'}.`);
    await loadData();
  };

  const filteredBanners = banners.filter(b => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (b.name || '').toLowerCase().includes(q) ||
      (b.title || '').toLowerCase().includes(q) ||
      (b.subtitle || '').toLowerCase().includes(q) ||
      (b.slot || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (pageFilter !== 'all' && b.page !== pageFilter) return false;
    if (groupFilter !== 'all' && b.slot !== groupFilter) return false;
    if (statusFilter === 'ON' && b.status !== 'ON') return false;
    if (statusFilter === 'OFF' && b.status !== 'OFF') return false;
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <ImageIcon className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Hero & Promotional Banners CMS</span>
          </h1>
          <p className="admin-sub-text">
            Create independent banner groups, customize typography, colors, multiple CTA buttons, and upload desktop & mobile artwork.
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
          <button
            onClick={handleOpenCreateBannerChoice}
            className="btn-primary-action"
          >
            <Plus size={16} />
            <span>Create Banner</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter & Group Selection Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search banner by title, group name, slot or page..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Banner Groups ({bannerGroups.length})</option>
            {bannerGroups.map(g => (
              <option key={g.slot} value={g.slot}>
                {g.name} (Slot: {g.slot})
              </option>
            ))}
          </select>

          <select
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Target Pages</option>
            <option value="home">Homepage</option>
            <option value="items">All Subscriptions</option>
            <option value="categories">Categories</option>
            <option value="offers">Offers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Statuses</option>
            <option value="ON">Active (ON)</option>
            <option value="OFF">Inactive (OFF)</option>
          </select>
        </div>
      </div>

      {/* Banners Grid / List */}
      <div className="admin-banners-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
        {filteredBanners.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: 'var(--admin-text-muted)' }}>
            No banners found. Click <strong>Create Banner</strong> to add a new slide or group.
          </div>
        ) : (
          filteredBanners.map(b => (
            <div 
              key={b.id} 
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                opacity: b.status === 'OFF' ? 0.65 : 1
              }}
            >
              {/* Preview Image / Solid Color Box */}
              <div 
                style={{
                  height: '140px',
                  background: b.mode === 'solid-color' ? (b.solidColor || '#0b132b') : '#070d1e',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {b.mode !== 'solid-color' && (
                  <img 
                    src={getCleanImageUrl(b.desktopImage, b.updatedAt)} 
                    alt={b.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                
                {/* Floating Group Badge */}
                <span 
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(11, 19, 43, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#38bdf8',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                  }}
                >
                  {b.groupName || `Group ${b.slot}`} (#{b.displayOrder})
                </span>

                {/* Status Toggle Pill */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(b)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: b.status === 'ON' ? '#10b981' : '#64748b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '3px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {b.status === 'ON' ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{b.status === 'ON' ? 'LIVE' : 'OFF'}</span>
                </button>
              </div>

              {/* Banner Details */}
              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                  {b.title || b.name}
                </h3>
                {b.subtitle && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--admin-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {b.subtitle}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px', fontSize: '0.74rem' }}>
                  <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                    Page: {b.page}
                  </span>
                  <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                    Slot: {b.slot}
                  </span>
                  {b.ctaText && (
                    <span style={{ background: 'rgba(2, 132, 199, 0.1)', padding: '2px 6px', borderRadius: '4px', color: '#0284c7', fontWeight: 700 }}>
                      Btn: {b.ctaText}
                    </span>
                  )}
                  {b.buttons && b.buttons.length > 0 && (
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', color: '#10b981', fontWeight: 700 }}>
                      +{b.buttons.length} Custom Btns
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ padding: '10px 14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                <button
                  type="button"
                  onClick={() => handleDuplicateBanner(b)}
                  className="btn-refresh-action"
                  title="Duplicate banner"
                  style={{ fontSize: '0.78rem', gap: '4px' }}
                >
                  <Copy size={13} /> Duplicate
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(b)}
                    className="btn-primary-action"
                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b.id, b.name || b.title)}
                    className="btn-refresh-action"
                    style={{ color: 'var(--admin-danger)' }}
                    title="Delete banner"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* STEP 1: CREATE BANNER DESTINATION CHOICE MODAL (Requirement 1.5) */}
      {isGroupChoiceModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={18} color="#0284c7" />
                <span>Select Banner Destination Group</span>
              </h2>
              <button type="button" onClick={() => setIsGroupChoiceModalOpen(false)} className="admin-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
                Where would you like to place this new banner? You can attach it to an existing slideshow group or initialize a brand new independent group.
              </p>

              {/* Option A vs Option B Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCreationOption('existing')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: `2px solid ${selectedCreationOption === 'existing' ? '#0284c7' : '#e2e8f0'}`,
                    background: selectedCreationOption === 'existing' ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ color: '#0f172a', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    1. Add to Existing Group
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Attach to an existing slideshow (e.g. Hero Slider).
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCreationOption('new')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: `2px solid ${selectedCreationOption === 'new' ? '#0284c7' : '#e2e8f0'}`,
                    background: selectedCreationOption === 'new' ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ color: '#0f172a', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    2. Create New Group
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Create an independent slideshow or standalone slot.
                  </span>
                </button>
              </div>

              {/* Option A: Select Existing Group */}
              {selectedCreationOption === 'existing' && (
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label className="admin-form-label" style={{ fontWeight: 800, marginBottom: '8px' }}>
                    Choose Target Banner Group:
                  </label>
                  <select
                    className="admin-form-select"
                    value={chosenGroupSlot}
                    onChange={(e) => setChosenGroupSlot(e.target.value)}
                  >
                    {bannerGroups.map(g => (
                      <option key={g.slot} value={g.slot}>
                        {g.name} (Slot: {g.slot} • {g.bannerCount || 0} Current Slides • Page: {g.page})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Option B: Create New Group */}
              {selectedCreationOption === 'new' && (
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">New Group Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Festival Special Deals, Anime Spotlight"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Unique Slot Code</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. festival-hero, offers-strip"
                        value={newGroupSlot}
                        onChange={(e) => setNewGroupSlot(e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Target Page</label>
                      <select
                        className="admin-form-select"
                        value={newGroupPage}
                        onChange={(e) => setNewGroupPage(e.target.value as any)}
                      >
                        <option value="home">Homepage</option>
                        <option value="items">All Subscriptions</option>
                        <option value="categories">Categories</option>
                        <option value="offers">Offers</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setIsGroupChoiceModalOpen(false)}
                className="btn-modal-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToBannerEditor}
                className="btn-modal-primary"
              >
                <span>Continue to Banner Editor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL BANNER CREATE & EDIT MODAL (Requirements 1.1, 1.2, 1.3, 1.4) */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '840px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingBanner ? `Edit Banner: ${editingBanner.name || editingBanner.title}` : `Create Banner for "${formGroupName}"`}
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

                {/* 1. Basic Content */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#0f172a', fontWeight: 800 }}>
                    1. Text Content & Messaging
                  </h4>
                  
                  <div className="admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Banner Internal Name</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. Netflix 4K Promo Slide"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Promotional Badge Text</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. SPECIAL OFFER • 70% OFF"
                        value={formBadgeText}
                        onChange={(e) => setFormBadgeText(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group" style={{ marginTop: '10px' }}>
                    <label className="admin-form-label">Main Heading Title *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. ALL YOUR FAVOURITE OTT PLATFORMS"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginTop: '10px' }}>
                    <label className="admin-form-label">Subheading Text</label>
                    <textarea
                      className="admin-form-textarea"
                      rows={2}
                      placeholder="e.g. Stream 4K Ultra HD on Netflix, Prime Video, Disney+ Hotstar with instant WhatsApp delivery."
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginTop: '10px' }}>
                    <label className="admin-form-label">Supporting / Description Text (Optional)</label>
                    <textarea
                      className="admin-form-textarea"
                      rows={2}
                      placeholder="e.g. Verified private screen profiles with 100% full duration replacement guarantee."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* 2. Text & Button Color Customization (Requirement 1.2) */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Palette size={15} color="#0284c7" />
                    <span>2. Text & Element Color Customization</span>
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {/* Title Color */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.76rem' }}>Main Heading Color</label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="color" value={formTitleColor} onChange={(e) => setFormTitleColor(e.target.value)} style={{ width: '36px', height: '32px', border: 'none', cursor: 'pointer' }} />
                        <input type="text" className="admin-form-input" value={formTitleColor} onChange={(e) => setFormTitleColor(e.target.value)} style={{ fontSize: '0.8rem' }} />
                      </div>
                    </div>

                    {/* Subheading Color */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.76rem' }}>Subheading Color</label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="color" value={formSubtitleColor} onChange={(e) => setFormSubtitleColor(e.target.value)} style={{ width: '36px', height: '32px', border: 'none', cursor: 'pointer' }} />
                        <input type="text" className="admin-form-input" value={formSubtitleColor} onChange={(e) => setFormSubtitleColor(e.target.value)} style={{ fontSize: '0.8rem' }} />
                      </div>
                    </div>

                    {/* Badge Color */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.76rem' }}>Badge Label Color</label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="color" value={formBadgeColor} onChange={(e) => setFormBadgeColor(e.target.value)} style={{ width: '36px', height: '32px', border: 'none', cursor: 'pointer' }} />
                        <input type="text" className="admin-form-input" value={formBadgeColor} onChange={(e) => setFormBadgeColor(e.target.value)} style={{ fontSize: '0.8rem' }} />
                      </div>
                    </div>

                    {/* Supporting Text Color */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.76rem' }}>Supporting Text Color</label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="color" value={formDescriptionColor} onChange={(e) => setFormDescriptionColor(e.target.value)} style={{ width: '36px', height: '32px', border: 'none', cursor: 'pointer' }} />
                        <input type="text" className="admin-form-input" value={formDescriptionColor} onChange={(e) => setFormDescriptionColor(e.target.value)} style={{ fontSize: '0.8rem' }} />
                      </div>
                    </div>

                    {/* Button Text Color */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.76rem' }}>Button Text Color</label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="color" value={formBtnTextColor} onChange={(e) => setFormBtnTextColor(e.target.value)} style={{ width: '36px', height: '32px', border: 'none', cursor: 'pointer' }} />
                        <input type="text" className="admin-form-input" value={formBtnTextColor} onChange={(e) => setFormBtnTextColor(e.target.value)} style={{ fontSize: '0.8rem' }} />
                      </div>
                    </div>

                    {/* Button Background Color */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.76rem' }}>Button Background Color</label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="color" value={formBtnBgColor} onChange={(e) => setFormBtnBgColor(e.target.value)} style={{ width: '36px', height: '32px', border: 'none', cursor: 'pointer' }} />
                        <input type="text" className="admin-form-input" value={formBtnBgColor} onChange={(e) => setFormBtnBgColor(e.target.value)} style={{ fontSize: '0.8rem' }} />
                      </div>
                    </div>

                    {/* Button Border Color */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.76rem' }}>Button Border Color</label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="color" value={formBtnBorderColor} onChange={(e) => setFormBtnBorderColor(e.target.value)} style={{ width: '36px', height: '32px', border: 'none', cursor: 'pointer' }} />
                        <input type="text" className="admin-form-input" value={formBtnBorderColor} onChange={(e) => setFormBtnBorderColor(e.target.value)} style={{ fontSize: '0.8rem' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Action Buttons & Multiple Buttons (Requirement 1.1, 1.4) */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#0f172a', fontWeight: 800 }}>
                    3. Action Buttons Management
                  </h4>

                  {/* Primary CTA */}
                  <div className="admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Primary Button Label</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. Shop Now"
                        value={formCtaText}
                        onChange={(e) => setFormCtaText(e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Primary Button Link Destination</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. /items or /category/movies-series"
                        value={formCtaLink}
                        onChange={(e) => setFormCtaLink(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <div className="admin-form-row-2" style={{ marginTop: '10px' }}>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Secondary Button Label (Optional)</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. Explore Categories"
                        value={formSecondaryCtaText}
                        onChange={(e) => setFormSecondaryCtaText(e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Secondary Button Link Destination</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. #categories or /offers"
                        value={formSecondaryCtaLink}
                        onChange={(e) => setFormSecondaryCtaLink(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Add Multiple Extra Custom Buttons */}
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                    <label className="admin-form-label" style={{ fontWeight: 700 }}>
                      Additional Custom Buttons ({formButtons.length})
                    </label>

                    {formButtons.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {formButtons.map(btn => (
                          <div 
                            key={btn.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{btn.label}</strong>
                              <span style={{ fontSize: '0.76rem', color: '#64748b', marginLeft: '8px' }}>({btn.link})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomButton(btn.id)}
                              style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', alignItems: 'flex-end' }}>
                      <div className="admin-form-group">
                        <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Button Text</label>
                        <input type="text" className="admin-form-input" placeholder="e.g. WhatsApp" value={newBtnLabel} onChange={(e) => setNewBtnLabel(e.target.value)} />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Link URL</label>
                        <input type="text" className="admin-form-input" placeholder="e.g. /items" value={newBtnLink} onChange={(e) => setNewBtnLink(e.target.value)} />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomButton}
                        className="btn-primary-action"
                        style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                      >
                        <Plus size={13} /> Add Button
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Desktop & Mobile Image Uploads (Requirement 1.3) */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#0f172a', fontWeight: 800 }}>
                    4. Desktop & Mobile Banner Images (Upload & Replace)
                  </h4>

                  <div className="admin-form-row-2">
                    {/* Desktop Image */}
                    <div className="admin-form-group">
                      <label className="admin-form-label">Desktop Banner Image (16:9 / 1920x600 recommended)</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="Image URL or upload below"
                        value={formDesktopImage}
                        onChange={(e) => setFormDesktopImage(e.target.value)}
                      />
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <label className="btn-primary-action" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.78rem' }}>
                          <Upload size={13} />
                          <span>{isUploadingDesktop ? 'Uploading...' : 'Upload PC Image'}</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'desktop')} style={{ display: 'none' }} />
                        </label>
                        {formDesktopImage && (
                          <button
                            type="button"
                            onClick={() => setFormDesktopImage('')}
                            className="btn-refresh-action"
                            style={{ color: '#dc2626', fontSize: '0.78rem' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {formDesktopImage && (
                        <div style={{ marginTop: '8px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                          <img src={getCleanImageUrl(formDesktopImage)} alt="PC Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>

                    {/* Mobile Image */}
                    <div className="admin-form-group">
                      <label className="admin-form-label">Mobile Banner Image (4:5 or 1:1 mobile portrait)</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="Mobile image URL (fallback to PC if empty)"
                        value={formMobileImage}
                        onChange={(e) => setFormMobileImage(e.target.value)}
                      />
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <label className="btn-primary-action" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.78rem' }}>
                          <Smartphone size={13} />
                          <span>{isUploadingMobile ? 'Uploading...' : 'Upload Mobile Image'}</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mobile')} style={{ display: 'none' }} />
                        </label>
                        {formMobileImage && (
                          <button
                            type="button"
                            onClick={() => setFormMobileImage('')}
                            className="btn-refresh-action"
                            style={{ color: '#dc2626', fontSize: '0.78rem' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {formMobileImage && (
                        <div style={{ marginTop: '8px', height: '80px', width: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                          <img src={getCleanImageUrl(formMobileImage)} alt="Mobile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Placement, Group & Display Order (Requirement 1.6) */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#0f172a', fontWeight: 800 }}>
                    5. Group Placement & Display Order
                  </h4>

                  <div className="admin-form-row-3">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Assigned Group / Slot</label>
                      <select
                        className="admin-form-select"
                        value={formSlot}
                        onChange={(e) => {
                          setFormSlot(e.target.value);
                          const g = bannerGroups.find(grp => grp.slot === e.target.value);
                          if (g) setFormGroupName(g.name);
                        }}
                      >
                        {bannerGroups.map(g => (
                          <option key={g.slot} value={g.slot}>{g.name} (Slot: {g.slot})</option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Display Order (# in Group)</label>
                      <input
                        type="number"
                        min="1"
                        className="admin-form-input"
                        value={formDisplayOrder}
                        onChange={(e) => setFormDisplayOrder(e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Status</label>
                      <select
                        className="admin-form-select"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                      >
                        <option value="ON">Active (ON)</option>
                        <option value="OFF">Inactive (OFF)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-modal-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-primary"
                >
                  <Check size={14} />
                  <span>{editingBanner ? 'Save Changes' : 'Create Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
