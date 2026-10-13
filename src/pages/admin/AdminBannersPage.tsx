import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  Image as ImageIcon, RefreshCw, AlertCircle, Eye, EyeOff, 
  Copy, Layers, Smartphone, Monitor, Sliders, ExternalLink, Palette,
  ArrowUp, ArrowDown, ChevronRight, ArrowLeft, AlignLeft, AlignCenter, AlignRight, Layout, Info,
  Sparkles, FolderPlus, Grid, Play, Link as LinkIcon, CheckSquare, Square, Folder
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
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // NAVIGATION STATE: null = Show Groups List, string = Show Opened Group's Banners
  const [selectedGroupSlot, setSelectedGroupSlot] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // MODAL 1: Create or Edit Group Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<BannerGroup | null>(null);
  const [groupFormName, setGroupFormName] = useState('');
  const [groupFormSlot, setGroupFormSlot] = useState('');
  const [groupFormPage, setGroupFormPage] = useState<BannerTargetPage>('home');
  const [groupFormDisplayMode, setGroupFormDisplayMode] = useState<'slider' | 'fixed'>('slider');
  const [groupFormAutoplay, setGroupFormAutoplay] = useState(true);
  const [groupFormInterval, setGroupFormInterval] = useState('5');
  const [groupFormDescription, setGroupFormDescription] = useState('');
  const [groupFormStatus, setGroupFormStatus] = useState<'ON' | 'OFF'>('ON');

  // MODAL 2: Add Existing Banners into Opened Group Modal
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const [selectedExistingBannerIds, setSelectedExistingBannerIds] = useState<string[]>([]);

  // MODAL 3: Create or Edit Banner Form Modal
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Banner Form Fields
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('SPECIAL OFFER');
  const [formMode, setFormMode] = useState<BannerImageMode>('image-only');
  const [formDisplayMode, setFormDisplayMode] = useState<'slider' | 'fixed'>('slider');
  const [formSolidColor, setFormSolidColor] = useState('#0b132b');
  const [formTitleColor, setFormTitleColor] = useState('#ffffff');
  const [formSubtitleColor, setFormSubtitleColor] = useState('#cbd5e1');
  const [formBadgeColor, setFormBadgeColor] = useState('#38bdf8');
  const [formDescriptionColor, setFormDescriptionColor] = useState('#94a3b8');
  const [formBtnBgColor, setFormBtnBgColor] = useState('#0284c7');
  const [formBtnTextColor, setFormBtnTextColor] = useState('#ffffff');
  const [formBtnBorderColor, setFormBtnBorderColor] = useState('#0284c7');
  const [formOverlayColor, setFormOverlayColor] = useState('#000000');
  const [formOverlayOpacity, setFormOverlayOpacity] = useState(0.4);
  const [formTextPosition, setFormTextPosition] = useState<BannerTextPosition>('left');
  const [formContentPlacement, setFormContentPlacement] = useState<BannerVerticalPlacement>('center');
  const [formButtonPlacement, setFormButtonPlacement] = useState<BannerTextPosition>('left');
  const [formCtaText, setFormCtaText] = useState('Shop Now');
  const [formCtaLink, setFormCtaLink] = useState('/items');
  const [formSecondaryCtaText, setFormSecondaryCtaText] = useState('');
  const [formSecondaryCtaLink, setFormSecondaryCtaLink] = useState('');
  const [formButtons, setFormButtons] = useState<BannerButton[]>([]);
  const [newBtnLabel, setNewBtnLabel] = useState('');
  const [newBtnLink, setNewBtnLink] = useState('');
  const [formDesktopImage, setFormDesktopImage] = useState('');
  const [formMobileImage, setFormMobileImage] = useState('');
  const [formTargetPage, setFormTargetPage] = useState<BannerTargetPage>('home');
  const [formSlot, setFormSlot] = useState('01');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formStatus, setFormStatus] = useState<'ON' | 'OFF'>('ON');

  // Image Uploading State
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bns, groups] = await Promise.all([
        ottApi.getAllBannersAdmin(),
        ottApi.getBannerGroups()
      ]);
      setBanners(bns);
      setBannerGroups(groups);
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

  // Find active group object if one is opened
  const activeGroup = bannerGroups.find(g => g.slot === selectedGroupSlot);
  
  // Banners in current active group (sorted by displayOrder)
  const currentGroupBanners = selectedGroupSlot
    ? banners
        .filter(b => (b.slot || '01') === selectedGroupSlot)
        .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1))
    : [];

  // ====================================================================
  // GROUP ACTIONS (Create, Edit, Delete, Open)
  // ====================================================================
  const handleOpenCreateGroupModal = () => {
    setEditingGroup(null);
    setGroupFormName('');
    const newSlotId = `group-${Date.now().toString().slice(-4)}`;
    setGroupFormSlot(newSlotId);
    setGroupFormPage('home');
    setGroupFormDisplayMode('slider');
    setGroupFormAutoplay(true);
    setGroupFormInterval('5');
    setGroupFormDescription('');
    setGroupFormStatus('ON');
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroupModal = (g: BannerGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingGroup(g);
    setGroupFormName(g.name);
    setGroupFormSlot(g.slot);
    setGroupFormPage(g.page || 'home');
    const mode = g.displayMode || (g.style === 'fixed' || g.style === 'single' ? 'fixed' : 'slider');
    setGroupFormDisplayMode(mode);
    setGroupFormAutoplay(g.autoplay ?? true);
    setGroupFormInterval(String(g.interval || 5));
    setGroupFormDescription(g.description || '');
    setGroupFormStatus(g.status || 'ON');
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormName.trim()) {
      alert('Please enter a group name.');
      return;
    }

    const groupToSave: BannerGroup = {
      id: editingGroup?.id || groupFormSlot || `group-${Date.now().toString().slice(-4)}`,
      name: groupFormName.trim(),
      slot: groupFormSlot || `group-${Date.now().toString().slice(-4)}`,
      page: groupFormPage,
      style: groupFormDisplayMode === 'slider' ? 'auto-slide' : 'fixed',
      displayMode: groupFormDisplayMode,
      autoplay: groupFormAutoplay,
      interval: Number(groupFormInterval) || 5,
      status: groupFormStatus,
      description: groupFormDescription.trim() || undefined
    };

    await ottApi.saveBannerGroup(groupToSave);
    await ottApi.logAudit(editingGroup ? 'UPDATE_BANNER_GROUP' : 'CREATE_BANNER_GROUP', 'banner_groups', groupToSave.slot, { name: groupToSave.name });
    showToast(`Banner group "${groupToSave.name}" saved successfully!`);
    setIsGroupModalOpen(false);
    await loadData();
  };

  const handleDeleteGroup = async (slot: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (slot === '01') {
      alert('Home Page Group 1 (Slot 01) is the core default hero group and cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete banner group "${name}"? Any banners in this group will be moved to Group 1.`)) {
      await ottApi.deleteBannerGroup(slot);
      await ottApi.logAudit('DELETE_BANNER_GROUP', 'banner_groups', slot, { name });
      if (selectedGroupSlot === slot) {
        setSelectedGroupSlot(null);
      }
      showToast(`Group "${name}" deleted.`);
      await loadData();
    }
  };

  // ====================================================================
  // BANNER ACTIONS INSIDE AN OPENED GROUP
  // ====================================================================
  const handleOpenCreateBannerInsideGroup = () => {
    if (!selectedGroupSlot) return;
    const parentGroup = bannerGroups.find(g => g.slot === selectedGroupSlot);
    const existingCount = currentGroupBanners.length;
    const nextOrder = existingCount + 1;
    const groupMode = parentGroup?.displayMode || (parentGroup?.style === 'fixed' ? 'fixed' : 'slider');

    setEditingBanner(null);
    setFormName('');
    setFormTitle('');
    setFormSubtitle('');
    setFormDescription('');
    setFormBadgeText('SPECIAL OFFER');
    setFormMode('image-only');
    setFormDisplayMode(groupMode);
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
    setFormTargetPage(parentGroup?.page || 'home');
    setFormSlot(selectedGroupSlot);
    setFormDisplayOrder(String(nextOrder));
    setFormStatus('ON');
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: HeroBanner) => {
    setEditingBanner(b);
    setFormName(b.name || b.title);
    setFormTitle(b.title || '');
    setFormSubtitle(b.subtitle || '');
    setFormDescription(b.description || '');
    setFormBadgeText(b.badgeText || '');
    setFormMode(b.mode || 'image-only');
    const mode = b.displayMode || (b.style === 'fixed' || b.style === 'single' ? 'fixed' : 'slider');
    setFormDisplayMode(mode);
    setFormSolidColor(b.solidColor || '#0b132b');
    setFormTitleColor(b.titleColor || '#ffffff');
    setFormSubtitleColor(b.subtitleColor || '#cbd5e1');
    setFormBadgeColor(b.badgeColor || '#38bdf8');
    setFormDescriptionColor(b.descriptionColor || '#94a3b8');
    setFormBtnBgColor(b.btnBgColor || '#0284c7');
    setFormBtnTextColor(b.btnTextColor || '#ffffff');
    setFormBtnBorderColor(b.btnBorderColor || '#0284c7');
    setFormOverlayColor(b.overlayColor || '#000000');
    setFormOverlayOpacity(b.overlayOpacity ?? 0.4);
    setFormTextPosition(b.textPosition || 'left');
    setFormContentPlacement(b.contentPlacement || 'center');
    setFormButtonPlacement(b.buttonPlacement || 'left');
    setFormCtaText(b.ctaText || '');
    setFormCtaLink(b.ctaLink || '/items');
    setFormSecondaryCtaText(b.secondaryCtaText || '');
    setFormSecondaryCtaLink(b.secondaryCtaLink || '');
    setFormButtons(b.buttons || []);
    setFormDesktopImage(b.desktopImage || '');
    setFormMobileImage(b.mobileImage || '');
    setFormTargetPage(b.page || 'home');
    setFormSlot(b.slot || selectedGroupSlot || '01');
    setFormDisplayOrder(String(b.displayOrder || 1));
    setFormStatus(b.status || 'ON');
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() && !formTitle.trim() && !formDesktopImage.trim() && formMode !== 'solid-color') {
      alert('Please provide a banner name or upload an artwork image.');
      return;
    }

    const assignedSlot = formSlot || selectedGroupSlot || '01';
    const parentGroup = bannerGroups.find(g => g.slot === assignedSlot);

    const bannerData: HeroBanner = {
      id: editingBanner?.id || 'banner-' + Date.now(),
      name: formName.trim() || formTitle.trim() || 'Custom Banner',
      groupName: parentGroup?.name || `Group ${assignedSlot}`,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      description: formDescription.trim(),
      badgeText: formBadgeText.trim(),
      mode: formMode || 'image-only',
      displayMode: formDisplayMode,
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
      slot: assignedSlot,
      style: formDisplayMode === 'slider' ? 'auto-slide' : 'fixed',
      autoplay: formDisplayMode === 'slider',
      interval: 5,
      displayOrder: Number(formDisplayOrder) || 1,
      status: formStatus,
      showText: Boolean(formTitle.trim() || formSubtitle.trim() || formDescription.trim()),
      updatedAt: Date.now()
    };

    await ottApi.saveBanner(bannerData);
    await ottApi.logAudit(editingBanner ? 'UPDATE_BANNER' : 'CREATE_BANNER', 'banners', bannerData.id, { 
      name: bannerData.name, 
      slot: bannerData.slot 
    });

    showToast(`Banner "${bannerData.name}" saved in Group "${bannerData.groupName}" & synchronized live!`);
    setIsBannerModalOpen(false);
    await loadData();
  };

  const handleToggleBannerStatus = async (b: HeroBanner) => {
    const nextStatus: 'ON' | 'OFF' = b.status === 'ON' ? 'OFF' : 'ON';
    const updated = { ...b, status: nextStatus, updatedAt: Date.now() };
    await ottApi.saveBanner(updated);
    showToast(`Banner is now ${nextStatus === 'ON' ? 'ACTIVE (Live)' : 'INACTIVE (Hidden)'}.`);
    await loadData();
  };

  const handleReorderBanner = async (bannerId: string, direction: 'up' | 'down') => {
    if (!selectedGroupSlot) return;
    await ottApi.reorderBannersInGroup(selectedGroupSlot, bannerId, direction);
    showToast('Banner display order updated.');
    await loadData();
  };

  const handleRemoveBannerFromGroup = async (b: HeroBanner) => {
    if (confirm(`Remove banner "${b.name || b.title}" from this group? (The banner will be unassigned but not deleted).`)) {
      await ottApi.removeBannerFromGroup(b.id);
      showToast('Banner removed from group.');
      await loadData();
    }
  };

  const handleDeleteBanner = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete banner "${name}"?`)) {
      await ottApi.deleteBanner(id);
      await ottApi.logAudit('DELETE_BANNER', 'banners', id, { name });
      showToast('Banner deleted permanently.');
      await loadData();
    }
  };

  // ====================================================================
  // ADD EXISTING BANNERS TO OPENED GROUP
  // ====================================================================
  const handleOpenAddExistingModal = () => {
    setSelectedExistingBannerIds([]);
    setIsAddExistingModalOpen(true);
  };

  const handleToggleSelectExistingBanner = (id: string) => {
    if (selectedExistingBannerIds.includes(id)) {
      setSelectedExistingBannerIds(selectedExistingBannerIds.filter(x => x !== id));
    } else {
      setSelectedExistingBannerIds([...selectedExistingBannerIds, id]);
    }
  };

  const handleConfirmAddExistingBanners = async () => {
    if (!selectedGroupSlot || !activeGroup || selectedExistingBannerIds.length === 0) {
      alert('Please select at least one banner to add.');
      return;
    }

    for (const bId of selectedExistingBannerIds) {
      await ottApi.addExistingBannerToGroup(bId, selectedGroupSlot, activeGroup.name);
    }

    showToast(`Added ${selectedExistingBannerIds.length} banner(s) to group "${activeGroup.name}".`);
    setIsAddExistingModalOpen(false);
    setSelectedExistingBannerIds([]);
    await loadData();
  };

  // Image Upload Handlers
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

  // Filter groups
  const filteredGroups = bannerGroups.filter(g => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (g.name || '').toLowerCase().includes(q) ||
      (g.slot || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (pageFilter !== 'all' && g.page !== pageFilter) return false;
    if (statusFilter === 'ON' && g.status !== 'ON') return false;
    if (statusFilter === 'OFF' && g.status !== 'OFF') return false;
    return true;
  });

  // Banners available to add (not in current group)
  const availableExistingBanners = banners.filter(b => (b.slot || '01') !== selectedGroupSlot);

  return (
    <div className="admin-page-container">
      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: BANNERS MAIN PAGE — SHOW ALL GROUPS FIRST (Default)   */}
      {/* ------------------------------------------------------------- */}
      {!selectedGroupSlot && (
        <>
          {/* Header Row: Title & Only 01 Primary Button ("+ Create Group") */}
          <div className="admin-header-row">
            <div className="admin-title-group">
              <h1 className="admin-main-heading">
                <Folder className="admin-heading-icon" style={{ color: '#0284c7' }} />
                <span>Banner Management</span>
              </h1>
              <p className="admin-sub-text">
                Organize banners into named groups, assign them to target pages, and configure slider or fixed displays.
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
                onClick={handleOpenCreateGroupModal}
                className="btn-primary-action"
              >
                <FolderPlus size={16} />
                <span>+ Create Group</span>
              </button>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="admin-alert-banner">
              <Check size={16} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="admin-filter-bar">
            <div className="admin-search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search banner groups by name or slot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
                className="admin-select-filter"
              >
                <option value="all">All Pages</option>
                <option value="home">Home Page</option>
                <option value="items">Items Page</option>
                <option value="offers">Offers Page</option>
                <option value="categories">Categories</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select-filter"
              >
                <option value="all">All Statuses</option>
                <option value="ON">Active</option>
                <option value="OFF">Inactive</option>
              </select>
            </div>
          </div>

          {/* Existing Banner Groups Grid */}
          <div style={{ marginTop: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text-main)', marginBottom: '12px' }}>
              Existing Banner Groups ({filteredGroups.length})
            </h2>

            {filteredGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: 'var(--admin-text-muted)' }}>
                No banner groups found. Click <strong>+ Create Group</strong> above to get started.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                {filteredGroups.map(g => {
                  const count = banners.filter(b => (b.slot || '01') === g.slot).length;
                  const mode = g.displayMode || (g.style === 'fixed' || g.style === 'single' ? 'fixed' : 'slider');
                  const isActive = g.status !== 'OFF';

                  return (
                    <div
                      key={g.slot}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px 18px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      {/* Top Info */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.74rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                            Slot: {g.slot} • Page: {g.page || 'home'}
                          </span>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 800, 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            background: isActive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                            color: isActive ? '#16a34a' : '#64748b'
                          }}>
                            {isActive ? '● Active' : '○ Inactive'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: '0 0 4px' }}>
                          {g.name}
                        </h3>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                          <span style={{ 
                            fontSize: '0.78rem', 
                            fontWeight: 700, 
                            color: '#0284c7', 
                            background: 'rgba(2, 132, 199, 0.08)', 
                            padding: '3px 10px', 
                            borderRadius: '6px' 
                          }}>
                            {count} banner{count === 1 ? '' : 's'}
                          </span>
                          <span style={{ 
                            fontSize: '0.78rem', 
                            fontWeight: 700, 
                            color: mode === 'slider' ? '#7c3aed' : '#d97706',
                            background: mode === 'slider' ? 'rgba(124, 58, 237, 0.08)' : 'rgba(217, 119, 6, 0.08)',
                            padding: '3px 10px', 
                            borderRadius: '6px' 
                          }}>
                            Display: {mode === 'slider' ? 'Slider' : 'Fixed'}
                          </span>
                        </div>

                        {g.description && (
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '8px 0 0', lineHeight: 1.4 }}>
                            {g.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedGroupSlot(g.slot)}
                          className="btn-primary-action"
                          style={{ flex: 1, padding: '7px 12px', fontSize: '0.82rem', justifyContent: 'center' }}
                        >
                          <span>Open Group</span>
                          <ChevronRight size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditGroupModal(g, e)}
                          className="btn-refresh-action"
                          style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                          title="Edit group name and settings"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        {g.slot !== '01' && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteGroup(g.slot, g.name, e)}
                            className="btn-refresh-action"
                            style={{ padding: '7px 10px', color: '#ef4444' }}
                            title="Delete this group"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: OPENED GROUP VIEW — SHOW ONLY ITS BANNERS             */}
      {/* ------------------------------------------------------------- */}
      {selectedGroupSlot && activeGroup && (
        <>
          {/* Back Navigation & Group Header */}
          <div style={{ marginBottom: '14px' }}>
            <button
              type="button"
              onClick={() => setSelectedGroupSlot(null)}
              className="btn-refresh-action"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.82rem', marginBottom: '10px' }}
            >
              <ArrowLeft size={14} />
              <span>← Back to All Banner Groups</span>
            </button>

            <div className="admin-header-row" style={{ alignItems: 'flex-start' }}>
              <div className="admin-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h1 className="admin-main-heading" style={{ margin: 0 }}>
                    {activeGroup.name}
                  </h1>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 800, 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    background: activeGroup.status !== 'OFF' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                    color: activeGroup.status !== 'OFF' ? '#16a34a' : '#64748b'
                  }}>
                    {activeGroup.status !== 'OFF' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#64748b' }}>
                  <span>Slot: <strong>{activeGroup.slot}</strong></span>
                  <span>•</span>
                  <span>Target Page: <strong>{activeGroup.page || 'home'}</strong></span>
                  <span>•</span>
                  <span>Display Mode: <strong>{(activeGroup.displayMode || (activeGroup.style === 'fixed' ? 'fixed' : 'slider')).toUpperCase()}</strong></span>
                </div>
              </div>

              <div className="admin-header-actions">
                <button
                  type="button"
                  onClick={(e) => handleOpenEditGroupModal(activeGroup, e)}
                  className="btn-refresh-action"
                  style={{ fontSize: '0.82rem', padding: '7px 12px' }}
                >
                  <Edit2 size={14} />
                  <span>Edit Group Settings</span>
                </button>
              </div>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="admin-alert-banner">
              <Check size={16} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Group Action Buttons: [+ Create Banner] & [+ Add Existing Banner] */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleOpenCreateBannerInsideGroup}
              className="btn-primary-action"
              style={{ padding: '8px 16px', fontSize: '0.86rem' }}
            >
              <Plus size={16} />
              <span>+ Create Banner</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddExistingModal}
              className="btn-refresh-action"
              style={{ padding: '8px 14px', fontSize: '0.84rem' }}
            >
              <Layers size={15} />
              <span>+ Add Existing Banner</span>
            </button>
          </div>

          {/* Banners List inside this group */}
          <div style={{ marginTop: '12px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--admin-text-main)', marginBottom: '10px' }}>
              Existing Banners in {activeGroup.name} ({currentGroupBanners.length})
            </h3>

            {currentGroupBanners.length === 0 ? (
              /* Required Empty State */
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1.5px dashed #cbd5e1',
                color: 'var(--admin-text-muted)'
              }}>
                <ImageIcon size={38} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', margin: '0 0 6px' }}>
                  No banners have been added to this group yet.
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 16px' }}>
                  Create a new banner specifically for this group or choose from existing banners in your library.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleOpenCreateBannerInsideGroup}
                    className="btn-primary-action"
                    style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                  >
                    <Plus size={14} />
                    <span>Create Banner</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenAddExistingModal}
                    className="btn-refresh-action"
                    style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                  >
                    <Layers size={14} />
                    <span>Add Existing Banner</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentGroupBanners.map((b, index) => {
                  const bMode = b.displayMode || (b.style === 'fixed' || b.style === 'single' ? 'fixed' : 'slider');
                  const isLive = b.status === 'ON';
                  const artwork = b.desktopImage || b.mobileImage;

                  return (
                    <div
                      key={b.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* Left: Position Badge & Thumbnail & Titles */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                        {/* Position Order Badge */}
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          background: '#f1f5f9', 
                          color: '#0f172a', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 800, 
                          fontSize: '0.82rem' 
                        }}>
                          #{index + 1}
                        </div>

                        {/* Thumbnail Artwork */}
                        <div style={{
                          width: '70px',
                          height: '46px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: b.solidColor || '#070d1e',
                          flexShrink: 0,
                          border: '1px solid #cbd5e1'
                        }}>
                          {artwork ? (
                            <img
                              src={getCleanImageUrl(artwork, b.updatedAt)}
                              alt={b.name || b.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/hero-bg.png';
                              }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#ffffff' }}>
                              Solid
                            </div>
                          )}
                        </div>

                        {/* Info Titles */}
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--admin-text-main)', display: 'block' }}>
                            {b.name || b.title || `Banner ${index + 1}`}
                          </strong>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Position: {b.displayOrder || index + 1}
                            </span>
                            <span>•</span>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 700, 
                              color: bMode === 'slider' ? '#7c3aed' : '#d97706',
                              background: bMode === 'slider' ? 'rgba(124, 58, 237, 0.08)' : 'rgba(217, 119, 6, 0.08)',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              {bMode === 'slider' ? 'Slider' : 'Fixed'}
                            </span>
                            {b.ctaText && (
                              <>
                                <span>•</span>
                                <span style={{ fontSize: '0.7rem', color: '#0284c7' }}>
                                  Btn: {b.ctaText}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Reorder & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Live Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleBannerStatus(b)}
                          className={`admin-badge ${isLive ? 'active' : 'inactive'}`}
                          style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', fontSize: '0.72rem' }}
                          title="Click to toggle active status"
                        >
                          {isLive ? <Eye size={12} /> : <EyeOff size={12} />}
                          <span>{isLive ? 'Active' : 'Inactive'}</span>
                        </button>

                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleReorderBanner(b.id, 'up')}
                          className="btn-refresh-action"
                          style={{ padding: '4px 6px', opacity: index === 0 ? 0.35 : 1 }}
                          title="Move banner up"
                        >
                          <ArrowUp size={13} />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={index === currentGroupBanners.length - 1}
                          onClick={() => handleReorderBanner(b.id, 'down')}
                          className="btn-refresh-action"
                          style={{ padding: '4px 6px', opacity: index === currentGroupBanners.length - 1 ? 0.35 : 1 }}
                          title="Move banner down"
                        >
                          <ArrowDown size={13} />
                        </button>

                        {/* Edit Banner */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditBanner(b)}
                          className="btn-primary-action"
                          style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>

                        {/* Remove from Group */}
                        <button
                          type="button"
                          onClick={() => handleRemoveBannerFromGroup(b)}
                          className="btn-refresh-action"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#64748b' }}
                          title="Remove from group without deleting"
                        >
                          Remove
                        </button>

                        {/* Permanent Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(b.id, b.name || b.title)}
                          className="btn-refresh-action"
                          style={{ padding: '4px 8px', color: '#ef4444' }}
                          title="Delete banner permanently"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================================================= */}
      {/* MODAL 1: CREATE OR EDIT GROUP FORM MODAL                       */}
      {/* ============================================================= */}
      {isGroupModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                <FolderPlus size={18} style={{ color: '#0284c7' }} />
                <span>{editingGroup ? 'Edit Banner Group' : 'Create New Banner Group'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="admin-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Group Name *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Home Page Group 2 or Offers Group 1"
                  value={groupFormName}
                  onChange={(e) => setGroupFormName(e.target.value)}
                  required
                />
                <span className="admin-form-hint">A recognizable label for organizing banners in this group.</span>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Page or Placement Association *</label>
                <select
                  className="admin-form-input"
                  value={groupFormPage}
                  onChange={(e) => setGroupFormPage(e.target.value as any)}
                >
                  <option value="home">Home Page</option>
                  <option value="items">All Subscriptions (Items)</option>
                  <option value="offers">Special Offers</option>
                  <option value="categories">Categories</option>
                  <option value="all">All Pages</option>
                </select>
                <span className="admin-form-hint">Where this group's banners will be eligible to render.</span>
              </div>

              {/* Display Mode: Slider vs Fixed */}
              <div className="admin-form-group">
                <label className="admin-form-label">Display Mode *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setGroupFormDisplayMode('slider')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${groupFormDisplayMode === 'slider' ? '#0284c7' : '#cbd5e1'}`,
                      background: groupFormDisplayMode === 'slider' ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                      color: groupFormDisplayMode === 'slider' ? '#0284c7' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Slider Carousel</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#64748b' }}>Rotates multiple slides</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGroupFormDisplayMode('fixed')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${groupFormDisplayMode === 'fixed' ? '#0284c7' : '#cbd5e1'}`,
                      background: groupFormDisplayMode === 'fixed' ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                      color: groupFormDisplayMode === 'fixed' ? '#0284c7' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Fixed Banner</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#64748b' }}>Single static section</span>
                  </button>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Optional Description</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Promotional banner group between featured and courses"
                  value={groupFormDescription}
                  onChange={(e) => setGroupFormDescription(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Status</label>
                <select
                  className="admin-form-input"
                  value={groupFormStatus}
                  onChange={(e) => setGroupFormStatus(e.target.value as any)}
                >
                  <option value="ON">Active (ON)</option>
                  <option value="OFF">Inactive (OFF)</option>
                </select>
              </div>

              <div className="admin-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="btn-refresh-action"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                >
                  <Check size={16} />
                  <span>{editingGroup ? 'Save Changes' : 'Create Group'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: ADD EXISTING BANNERS TO GROUP MODAL                   */}
      {/* ============================================================= */}
      {isAddExistingModalOpen && activeGroup && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                <Layers size={18} style={{ color: '#0284c7' }} />
                <span>Add Existing Banners to {activeGroup.name}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddExistingModalOpen(false)}
                className="admin-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 12px' }}>
                Select banners from your library to add to this group without re-uploading artwork.
              </p>

              {availableExistingBanners.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                  No other banners found in database. Click <strong>+ Create Banner</strong> to create one directly.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                  {availableExistingBanners.map(b => {
                    const isSelected = selectedExistingBannerIds.includes(b.id);
                    const artwork = b.desktopImage || b.mobileImage;

                    return (
                      <div
                        key={b.id}
                        onClick={() => handleToggleSelectExistingBanner(b.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: `1.5px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                          background: isSelected ? 'rgba(2, 132, 199, 0.05)' : '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? <CheckSquare size={18} color="#0284c7" /> : <Square size={18} color="#94a3b8" />}
                        
                        <div style={{ width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: b.solidColor || '#070d1e', flexShrink: 0 }}>
                          {artwork && (
                            <img src={getCleanImageUrl(artwork, b.updatedAt)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontSize: '0.84rem', color: '#1e293b', display: 'block' }}>{b.name || b.title}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Current Group: {b.groupName || b.slot} • Status: {b.status === 'ON' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="admin-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddExistingModalOpen(false)}
                  className="btn-refresh-action"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedExistingBannerIds.length === 0}
                  onClick={handleConfirmAddExistingBanners}
                  className="btn-primary-action"
                  style={{ opacity: selectedExistingBannerIds.length === 0 ? 0.5 : 1 }}
                >
                  <Check size={16} />
                  <span>Add Selected ({selectedExistingBannerIds.length}) Banners</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 3: CREATE / EDIT BANNER FORM MODAL                       */}
      {/* ============================================================= */}
      {isBannerModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                <ImageIcon size={18} style={{ color: '#0284c7' }} />
                <span>{editingBanner ? 'Edit Banner' : `Create Banner inside ${activeGroup?.name || 'Group'}`}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="admin-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="admin-modal-body">
              {/* Display Mode Selection: Slider vs Fixed */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ fontWeight: 800, color: '#0284c7' }}>
                  Display Mode (Slider or Fixed) *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setFormDisplayMode('slider')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1.5px solid ${formDisplayMode === 'slider' ? '#0284c7' : '#cbd5e1'}`,
                      background: formDisplayMode === 'slider' ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                      color: formDisplayMode === 'slider' ? '#0284c7' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Slider Banner (Carousel)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormDisplayMode('fixed')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1.5px solid ${formDisplayMode === 'fixed' ? '#0284c7' : '#cbd5e1'}`,
                      background: formDisplayMode === 'fixed' ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                      color: formDisplayMode === 'fixed' ? '#0284c7' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Fixed Banner (Single Section)
                  </button>
                </div>
              </div>

              {/* 1. Background Mode Selector (Solid Color, Image Only, Image + Blur Color) */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ fontWeight: 800, color: '#0284c7', marginBottom: '6px' }}>
                  Background Style Mode *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setFormMode('solid-color')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: `1.5px solid ${formMode === 'solid-color' ? '#0284c7' : '#cbd5e1'}`,
                      background: formMode === 'solid-color' ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                      color: formMode === 'solid-color' ? '#0284c7' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Solid Color
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormMode('image-only')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: `1.5px solid ${formMode === 'image-only' ? '#0284c7' : '#cbd5e1'}`,
                      background: formMode === 'image-only' ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                      color: formMode === 'image-only' ? '#0284c7' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Image Only (Crisp)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormMode('image-blur')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: `1.5px solid ${formMode === 'image-blur' ? '#0284c7' : '#cbd5e1'}`,
                      background: formMode === 'image-blur' ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                      color: formMode === 'image-blur' ? '#0284c7' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Image + Blur Color
                  </button>
                </div>

                {formMode === 'solid-color' && (
                  <div style={{ marginTop: '12px' }}>
                    <label className="admin-form-label">Solid Background Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="color"
                        value={formSolidColor}
                        onChange={(e) => setFormSolidColor(e.target.value)}
                        style={{ width: '42px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        className="admin-form-input"
                        value={formSolidColor}
                        onChange={(e) => setFormSolidColor(e.target.value)}
                        style={{ maxWidth: '120px' }}
                      />
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {COLOR_PRESETS.slice(4).map(p => (
                          <button
                            key={p.hex}
                            type="button"
                            onClick={() => setFormSolidColor(p.hex)}
                            title={p.name}
                            style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: p.hex, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Basic Info & Artwork Images */}
              <div className="admin-form-group">
                <label className="admin-form-label">Banner Internal Label / Name *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Netflix 4K Super Promo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              {formMode !== 'solid-color' && (
                <>
                  {/* Desktop Image Upload & URL */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Desktop Image Artwork *</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="https://... or /hero-bg.png"
                        value={formDesktopImage}
                        onChange={(e) => setFormDesktopImage(e.target.value)}
                      />
                      <label className="btn-primary-action" style={{ padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <Upload size={14} />
                        <span>{isUploadingDesktop ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e, 'desktop')}
                        />
                      </label>
                    </div>
                    <span className="admin-form-hint">Recommended desktop size: 1920x600 or 1200x400.</span>
                  </div>

                  {/* Mobile Image Upload & URL */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Mobile Image Artwork (Optional)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. /hero-mobile-1.png"
                        value={formMobileImage}
                        onChange={(e) => setFormMobileImage(e.target.value)}
                      />
                      <label className="btn-refresh-action" style={{ padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <Upload size={14} />
                        <span>{isUploadingMobile ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e, 'mobile')}
                        />
                      </label>
                    </div>
                    <span className="admin-form-hint">If left empty, desktop image is used on mobile.</span>
                  </div>
                </>
              )}

              {/* Text Alignment Controls */}
              <div className="admin-form-group">
                <label className="admin-form-label">Text Content Alignment</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setFormTextPosition('left')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: `1.5px solid ${formTextPosition === 'left' ? '#0284c7' : '#cbd5e1'}`,
                      background: formTextPosition === 'left' ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                      color: formTextPosition === 'left' ? '#0284c7' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <AlignLeft size={14} />
                    <span>Left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTextPosition('center')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: `1.5px solid ${formTextPosition === 'center' ? '#0284c7' : '#cbd5e1'}`,
                      background: formTextPosition === 'center' ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                      color: formTextPosition === 'center' ? '#0284c7' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <AlignCenter size={14} />
                    <span>Center</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTextPosition('right')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: `1.5px solid ${formTextPosition === 'right' ? '#0284c7' : '#cbd5e1'}`,
                      background: formTextPosition === 'right' ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                      color: formTextPosition === 'right' ? '#0284c7' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <AlignRight size={14} />
                    <span>Right</span>
                  </button>
                </div>
              </div>

              {/* Text Overlays (Optional) & Color Pickers */}
              <div className="admin-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="admin-form-label">Banner Heading / Title (Optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Title Color:</span>
                    <input
                      type="color"
                      value={formTitleColor}
                      onChange={(e) => setFormTitleColor(e.target.value)}
                      style={{ width: '28px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
                    />
                  </div>
                </div>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Leave empty if text is already inside the artwork image"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="admin-form-label">Sub-Heading / Tagline (Optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Subtitle Color:</span>
                    <input
                      type="color"
                      value={formSubtitleColor}
                      onChange={(e) => setFormSubtitleColor(e.target.value)}
                      style={{ width: '28px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
                    />
                  </div>
                </div>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Stream 4K Ultra HD on Netflix, Hotstar & Prime"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="admin-form-label">Description (Optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Text Color:</span>
                    <input
                      type="color"
                      value={formDescriptionColor}
                      onChange={(e) => setFormDescriptionColor(e.target.value)}
                      style={{ width: '28px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
                    />
                  </div>
                </div>
                <textarea
                  className="admin-form-input"
                  rows={2}
                  placeholder="e.g. Verified private accounts with instant WhatsApp delivery"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Action Buttons & Colors */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ fontWeight: 800, color: '#0f172a' }}>
                  Primary Button
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontSize: '0.75rem' }}>Button Text</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Shop Now"
                      value={formCtaText}
                      onChange={(e) => setFormCtaText(e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontSize: '0.75rem' }}>Button URL Link</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. /items"
                      value={formCtaLink}
                      onChange={(e) => setFormCtaLink(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>Button BG:</span>
                    <input
                      type="color"
                      value={formBtnBgColor}
                      onChange={(e) => setFormBtnBgColor(e.target.value)}
                      style={{ width: '28px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>Text Color:</span>
                    <input
                      type="color"
                      value={formBtnTextColor}
                      onChange={(e) => setFormBtnTextColor(e.target.value)}
                      style={{ width: '28px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Repeatable Multiple Custom Buttons */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Additional Multiple Buttons ({formButtons.length})
                </label>

                {formButtons.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {formButtons.map((btn) => (
                      <div 
                        key={btn.id}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: btn.bgColor || '#0284c7', color: btn.textColor || '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {btn.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>→ {btn.link}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormButtons(formButtons.filter(b => b.id !== btn.id))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          title="Remove button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>New Button Label</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. WhatsApp Direct"
                      value={newBtnLabel}
                      onChange={(e) => setNewBtnLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>URL / WhatsApp Link</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. wa.me/919441323332"
                      value={newBtnLink}
                      onChange={(e) => setNewBtnLink(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newBtnLabel.trim() || !newBtnLink.trim()) return;
                      const nb: BannerButton = {
                        id: 'btn-' + Date.now(),
                        label: newBtnLabel.trim(),
                        link: newBtnLink.trim(),
                        bgColor: formBtnBgColor || '#0284c7',
                        textColor: formBtnTextColor || '#ffffff'
                      };
                      setFormButtons([...formButtons, nb]);
                      setNewBtnLabel('');
                      setNewBtnLink('');
                    }}
                    className="btn-refresh-action"
                    style={{ padding: '8px 12px', fontSize: '0.78rem' }}
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* LIVE MODAL PREVIEW */}
              <div style={{ marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={14} style={{ color: '#0284c7' }} />
                  <span>Live Banner Preview</span>
                </label>
                <div 
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    height: '180px',
                    backgroundColor: formMode === 'solid-color' ? formSolidColor : '#070d1e',
                    border: '1.5px solid #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '20px 24px'
                  }}
                >
                  {formMode !== 'solid-color' && (
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${formDesktopImage || '/hero-bg.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: formMode === 'image-blur' ? 'blur(8px) saturate(1.2)' : 'none',
                        transform: formMode === 'image-blur' ? 'scale(1.06)' : 'none'
                      }}
                    />
                  )}

                  {/* Scrim if text present and not image-only */}
                  {Boolean(formTitle || formSubtitle || formDescription) && formMode !== 'image-only' && (
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: formTextPosition === 'right' 
                          ? 'linear-gradient(270deg, rgba(7, 13, 30, 0.9) 0%, transparent 100%)' 
                          : formTextPosition === 'center'
                          ? 'rgba(7, 13, 30, 0.65)'
                          : 'linear-gradient(90deg, rgba(7, 13, 30, 0.9) 0%, transparent 100%)'
                      }}
                    />
                  )}

                  <div 
                    style={{
                      position: 'relative',
                      zIndex: 3,
                      textAlign: formTextPosition,
                      alignSelf: formTextPosition === 'center' ? 'center' : formTextPosition === 'right' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {formTitle && (
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: formTitleColor }}>
                        {formTitle}
                      </h3>
                    )}
                    {formSubtitle && (
                      <p style={{ margin: '0 0 4px', fontSize: '0.82rem', fontWeight: 600, color: formSubtitleColor }}>
                        {formSubtitle}
                      </p>
                    )}
                    {formDescription && (
                      <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: formDescriptionColor, maxWidth: '320px' }}>
                        {formDescription}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: formTextPosition === 'center' ? 'center' : formTextPosition === 'right' ? 'flex-end' : 'flex-start', marginTop: '6px' }}>
                      {formCtaText && (
                        <span 
                          style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            background: formBtnBgColor,
                            color: formBtnTextColor,
                            fontSize: '0.74rem',
                            fontWeight: 700
                          }}
                        >
                          {formCtaText}
                        </span>
                      )}
                      {formButtons.map(b => (
                        <span 
                          key={b.id}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            background: b.bgColor || formBtnBgColor,
                            color: b.textColor || formBtnTextColor,
                            fontSize: '0.74rem',
                            fontWeight: 700
                          }}
                        >
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Position & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Position in Group *</label>
                  <input
                    type="number"
                    min="1"
                    className="admin-form-input"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <select
                    className="admin-form-input"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                  >
                    <option value="ON">Active (ON)</option>
                    <option value="OFF">Inactive (OFF)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="btn-refresh-action"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                >
                  <Check size={16} />
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

export default AdminBannersPage;
