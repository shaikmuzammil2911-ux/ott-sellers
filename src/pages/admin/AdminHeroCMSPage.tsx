import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Save, Upload, Check, AlertCircle, RefreshCw, 
  Eye, EyeOff, Layout, ExternalLink, ArrowRight, Palette, 
  ToggleLeft, ToggleRight, Layers, MoveVertical, ShieldCheck, Zap, Image as ImageIcon,
  Edit3, Plus, Trash2, ArrowUp, ArrowDown, X
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { HomepageSectionCMS, BannerGroup, HeroBanner } from '../../types';

import { AdminBannersPage } from './AdminBannersPage';

const COLOR_PRESETS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Sky Cyan', hex: '#38bdf8' },
  { name: 'Amber Gold', hex: '#fbbf24' },
  { name: 'Emerald', hex: '#34d399' },
  { name: 'Rose Red', hex: '#fb7185' },
  { name: 'Lavender', hex: '#c084fc' }
];

export const AdminHeroCMSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sections' | 'hero_form' | 'banners_manager'>('sections');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<HomepageSectionCMS[]>([]);
  const [heroCMS, setHeroCMS] = useState<HomepageSectionCMS | null>(null);

  // Add Banner Section Modal State
  const [isAddBannerSectionOpen, setIsAddBannerSectionOpen] = useState(false);
  const [bannerGroups, setBannerGroups] = useState<BannerGroup[]>([]);
  const [allBanners, setAllBanners] = useState<HeroBanner[]>([]);
  const [selectedAddType, setSelectedAddType] = useState<'group' | 'single'>('group');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedBannerId, setSelectedBannerId] = useState<string>('');
  const [selectedSlotOrder, setSelectedSlotOrder] = useState<number>(4);

  // Form Fields for Hero
  const [badgeText, setBadgeText] = useState('Your Entertainment, Our Priority');
  const [badgeColor, setBadgeColor] = useState('#38bdf8');
  const [title, setTitle] = useState('All Your Favourite OTT Subscriptions in One Place');
  const [titleColor, setTitleColor] = useState('#ffffff');
  const [subtitle, setSubtitle] = useState('Stream 4K Ultra HD on Netflix, Prime Video, Disney+ Hotstar, ZEE5 & Sony LIV with instant private PIN activation.');
  const [subtitleColor, setSubtitleColor] = useState('#cbd5e1');
  const [description, setDescription] = useState('Verified 4K streaming accounts with instant WhatsApp credentials delivery and full duration replacement warranty.');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaLink, setCtaLink] = useState('/items');
  const [secondaryCtaText, setSecondaryCtaText] = useState('Explore Categories');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('#categories');
  const [desktopImage, setDesktopImage] = useState('/hero-bg.png');
  const [mobileImage, setMobileImage] = useState('/hero-mobile-1.png');

  // Uploading status
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allSections, groups, banners] = await Promise.all([
        ottApi.getHomepageSections(),
        ottApi.getBannerGroups(),
        ottApi.getAllBannersAdmin()
      ]);
      setSections(allSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      setBannerGroups(groups);
      setAllBanners(banners);
      if (groups.length > 0 && !selectedGroupId) setSelectedGroupId(groups[0].id);
      if (banners.length > 0 && !selectedBannerId) setSelectedBannerId(banners[0].id);

      const hero = allSections.find(s => s.sectionKey === 'hero') || allSections[0];
      if (hero) {
        setHeroCMS(hero);
        setTitle(hero.title || 'All Your Favourite OTT Subscriptions in One Place');
        setSubtitle(hero.subtitle || '');
        setDescription(hero.description || '');
        setBadgeText(hero.settings?.badgeText || 'Your Entertainment, Our Priority');
        setBadgeColor(hero.settings?.badgeColor || '#38bdf8');
        setTitleColor(hero.settings?.titleColor || '#ffffff');
        setSubtitleColor(hero.settings?.subtitleColor || '#cbd5e1');
        setCtaText(hero.settings?.ctaText || 'Shop Now');
        setCtaLink(hero.settings?.ctaLink || '/items');
        setSecondaryCtaText(hero.settings?.secondaryCtaText || 'Explore Categories');
        setSecondaryCtaLink(hero.settings?.secondaryCtaLink || '#categories');
        setDesktopImage(hero.imageUrl || '/hero-bg.png');
        setMobileImage(hero.settings?.mobileImage || '/hero-mobile-1.png');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleSection = async (secKey: string) => {
    const updated = sections.map(s => {
      if (s.sectionKey === secKey) {
        return { ...s, isActive: !s.isActive, updatedAt: Date.now() };
      }
      return s;
    });
    setSections(updated);
    await ottApi.saveHomepageSections(updated);
    await ottApi.logAudit('TOGGLE_SECTION_VISIBILITY', 'homepage_sections', secKey);
    setSaveSuccessMsg(`Section "${secKey}" visibility updated! Live website refreshed.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleOrderChange = async (secKey: string, newOrder: number) => {
    const updated = sections.map(s => {
      if (s.sectionKey === secKey) {
        return { ...s, displayOrder: newOrder, updatedAt: Date.now() };
      }
      return s;
    }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    setSections(updated);
    await ottApi.saveHomepageSections(updated);
    setSaveSuccessMsg('Section display order updated.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleMoveSection = async (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sections.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...sections];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((s, i) => {
      s.displayOrder = i + 1;
    });
    setSections(updated);
    await ottApi.saveHomepageSections(updated);
    setSaveSuccessMsg('Section order updated.');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleRemoveSection = async (secKey: string) => {
    if (!window.confirm('Remove this section from Homepage Layout? The original banner or group will remain safely saved in the database.')) {
      return;
    }
    const updated = sections.filter(s => s.sectionKey !== secKey);
    updated.forEach((s, i) => {
      s.displayOrder = i + 1;
    });
    setSections(updated);
    await ottApi.saveHomepageSections(updated);
    setSaveSuccessMsg('Section removed from Homepage Layout.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleAddBannerSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAddType === 'group') {
      const grp = bannerGroups.find(g => g.id === selectedGroupId);
      if (!grp) return;
      const newSec: HomepageSectionCMS = {
        id: `sec-grp-${Date.now()}`,
        sectionKey: `banner_group_${grp.id}`,
        type: 'banner_group',
        name: `Banner Group: ${grp.name}`,
        displayOrder: selectedSlotOrder,
        settings: {
          groupId: grp.id,
          displayMode: grp.displayMode || 'slider'
        },
        isActive: true,
        updatedAt: Date.now()
      };
      const updated = [...sections, newSec].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setSections(updated);
      await ottApi.saveHomepageSections(updated);
    } else {
      const bnr = allBanners.find(b => b.id === selectedBannerId);
      if (!bnr) return;
      const newSec: HomepageSectionCMS = {
        id: `sec-bnr-${Date.now()}`,
        sectionKey: `banner_single_${bnr.id}`,
        type: 'banner_single',
        name: `Banner: ${bnr.title || bnr.name || 'Standalone Banner'}`,
        displayOrder: selectedSlotOrder,
        settings: {
          bannerId: bnr.id,
          displayMode: 'fixed'
        },
        isActive: true,
        updatedAt: Date.now()
      };
      const updated = [...sections, newSec].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setSections(updated);
      await ottApi.saveHomepageSections(updated);
    }
    setIsAddBannerSectionOpen(false);
    setSaveSuccessMsg('New banner section added to Homepage! Live storefront updated.');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleUploadDesktop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDesktop(true);
    setUploadError(null);
    const res = await uploadService.uploadImage(file, 'banners');
    setIsUploadingDesktop(false);

    if (res.success && res.url) {
      setDesktopImage(res.url);
    } else {
      setUploadError(res.error || 'Failed to upload desktop hero image');
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
      setMobileImage(res.url);
    } else {
      setUploadError(res.error || 'Failed to upload mobile hero image');
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg(null);

    const updatedCMS: HomepageSectionCMS = {
      id: heroCMS?.id || 'sec-hero',
      sectionKey: 'hero',
      name: 'Hero Promotional Banner',
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      imageUrl: desktopImage,
      displayOrder: 1,
      settings: {
        badgeText: badgeText.trim(),
        badgeColor,
        titleColor,
        subtitleColor,
        ctaText: ctaText.trim(),
        ctaLink: ctaLink.trim(),
        secondaryCtaText: secondaryCtaText.trim(),
        secondaryCtaLink: secondaryCtaLink.trim(),
        mobileImage
      },
      isActive: heroCMS?.isActive ?? true
    };

    await ottApi.saveHomepageSection(updatedCMS);

    // Synchronize primary hero banner (slot 01, order 1) safely
    try {
      const banners = await ottApi.getAllBannersAdmin();
      const heroIdx = banners.findIndex(b => b.slot === '01' && b.displayOrder === 1);
      if (heroIdx >= 0) {
        const heroBanner = { ...banners[heroIdx] };
        heroBanner.title = title.trim();
        heroBanner.subtitle = subtitle.trim();
        heroBanner.description = description.trim();
        heroBanner.badgeText = badgeText.trim();
        heroBanner.titleColor = titleColor;
        heroBanner.subtitleColor = subtitleColor;
        heroBanner.badgeColor = badgeColor;
        heroBanner.ctaText = ctaText.trim();
        heroBanner.ctaLink = ctaLink.trim();
        heroBanner.secondaryCtaText = secondaryCtaText.trim() || undefined;
        heroBanner.secondaryCtaLink = secondaryCtaLink.trim() || undefined;
        heroBanner.desktopImage = desktopImage;
        if (mobileImage) heroBanner.mobileImage = mobileImage;
        banners[heroIdx] = heroBanner;
        await ottApi.saveBanners(banners);
      }
    } catch {}

    await ottApi.logAudit('UPDATE_HERO_CMS', 'homepage_sections', 'hero', { title: updatedCMS.title });
    setSaving(false);
    setSaveSuccessMsg('Hero banner content & styling saved to Supabase! Live storefront updated.');
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Layout className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Homepage CMS & Banner Manager</span>
          </h1>
          <p className="admin-sub-text">
            Activate or deactivate sections, edit primary hero banner artwork, and manage promotional rotating banners.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'banners_manager' ? 'sections' : 'banners_manager')}
            className="btn-primary-action"
            style={{ textDecoration: 'none' }}
          >
            <ImageIcon size={16} />
            <span>{activeTab === 'banners_manager' ? 'Back to Sections' : 'Promotional Banners Manager'}</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Reload from Supabase"
          >
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="admin-tabs-row" style={{ marginBottom: '4px' }}>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'sections' ? 'active' : ''}`}
          onClick={() => setActiveTab('sections')}
        >
          <Layers size={14} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
          <span>Homepage Sections ON/OFF</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'hero_form' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero_form')}
        >
          <Sparkles size={14} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
          <span>Hero Primary Banner</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'banners_manager' ? 'active' : ''}`}
          onClick={() => setActiveTab('banners_manager')}
        >
          <ImageIcon size={14} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
          <span>Promotional Banners & Slot Manager</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* View 1: Embedded Promotional Banners Page */}
      {activeTab === 'banners_manager' && (
        <div style={{ marginTop: '4px' }}>
          <AdminBannersPage />
        </div>
      )}

      {/* View 2: Sections & Hero Form */}
      {activeTab !== 'banners_manager' && (
        <>
          {activeTab === 'sections' && (
            /* 1. Section Visibility & Order Management Table */
            <div style={{
              background: '#070d1e',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '18px 20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Layers size={18} style={{ color: '#38bdf8' }} />
                    <span>Homepage Section Controls (ON / OFF)</span>
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0' }}>
                    Disabled sections will NOT render on the live customer website.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddBannerSectionOpen(true)}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
                    }}
                  >
                    <Plus size={15} />
                    <span>+ Add Banner Section</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('banners_manager')}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#38bdf8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <ImageIcon size={14} />
                    <span>Open All Banners</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '10px' }}>
                {sections.map((sec, idx) => {
                  const isCustomBannerSec = sec.type === 'banner_group' || sec.type === 'banner_single' || sec.sectionKey.startsWith('banner_');
                  return (
                    <div
                      key={sec.sectionKey}
                      style={{
                        background: sec.isActive ? '#0b132b' : 'rgba(15, 23, 42, 0.5)',
                        border: `1px solid ${sec.isActive ? '#1e293b' : '#334155'}`,
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        <span style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: isCustomBannerSec ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.06)',
                          color: isCustomBannerSec ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {String(sec.displayOrder || idx + 1).padStart(2, '0')}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: sec.isActive ? '#ffffff' : '#94a3b8', margin: 0, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sec.name || sec.sectionKey.replace(/_/g, ' ')}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.72rem', color: sec.isActive ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                              {sec.isActive ? '● Live' : '○ Hidden'}
                            </span>
                            {isCustomBannerSec && (
                              <span style={{ fontSize: '0.68rem', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                                {sec.type === 'banner_group' ? 'Banner Group' : 'Single Banner'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {/* Up / Down Controls */}
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, 'up')}
                          disabled={idx === 0}
                          style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: idx === 0 ? '#475569' : '#cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer'
                          }}
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, 'down')}
                          disabled={idx === sections.length - 1}
                          style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: idx === sections.length - 1 ? '#475569' : '#cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            cursor: idx === sections.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>

                        {sec.sectionKey === 'hero' && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('hero_form')}
                            style={{
                              background: 'rgba(56, 189, 248, 0.15)',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              color: '#38bdf8',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Edit Hero Promotional Banner"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                        )}

                        <select
                          value={sec.displayOrder || idx + 1}
                          onChange={(e) => handleOrderChange(sec.sectionKey, parseInt(e.target.value))}
                          style={{
                            background: '#070d1e',
                            border: '1px solid #1e293b',
                            borderRadius: '6px',
                            color: '#cbd5e1',
                            fontSize: '0.74rem',
                            padding: '3px 6px'
                          }}
                          title="Display Order"
                        >
                          {Array.from({ length: Math.max(sections.length, 10) }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>Slot {n}</option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleToggleSection(sec.sectionKey)}
                          style={{
                            background: sec.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: `1px solid ${sec.isActive ? '#22c55e' : '#ef4444'}`,
                            color: sec.isActive ? '#22c55e' : '#ef4444',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {sec.isActive ? 'Turn OFF' : 'Turn ON'}
                        </button>

                        {isCustomBannerSec && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.sectionKey)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              color: '#ef4444',
                              borderRadius: '6px',
                              padding: '4px 6px',
                              cursor: 'pointer'
                            }}
                            title="Remove from Homepage Layout"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Banner Section Modal */}
              {isAddBannerSectionOpen && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.82)',
                  backdropFilter: 'blur(5px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '16px'
                }}>
                  <div style={{
                    background: '#0b132b',
                    border: '1px solid #1e293b',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '520px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '24px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} style={{ color: '#38bdf8' }} />
                        <span>+ Add Banner Section to Homepage</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddBannerSectionOpen(false)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleAddBannerSection} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                          Choose Section Type:
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedAddType('group')}
                            style={{
                              padding: '10px',
                              borderRadius: '8px',
                              border: `1px solid ${selectedAddType === 'group' ? '#38bdf8' : '#1e293b'}`,
                              background: selectedAddType === 'group' ? 'rgba(56, 189, 248, 0.15)' : '#070d1e',
                              color: selectedAddType === 'group' ? '#38bdf8' : '#94a3b8',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            Banner Group (Slider / Fixed)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedAddType('single')}
                            style={{
                              padding: '10px',
                              borderRadius: '8px',
                              border: `1px solid ${selectedAddType === 'single' ? '#38bdf8' : '#1e293b'}`,
                              background: selectedAddType === 'single' ? 'rgba(56, 189, 248, 0.15)' : '#070d1e',
                              color: selectedAddType === 'single' ? '#38bdf8' : '#94a3b8',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            Individual Standalone Banner
                          </button>
                        </div>
                      </div>

                      {selectedAddType === 'group' ? (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                            Select Banner Group:
                          </label>
                          <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: '#070d1e',
                              border: '1px solid #1e293b',
                              borderRadius: '8px',
                              color: '#ffffff',
                              fontSize: '0.85rem'
                            }}
                          >
                            {bannerGroups.map(grp => (
                              <option key={grp.id} value={grp.id}>
                                {grp.name} ({grp.bannerCount || 0} banners, {grp.displayMode === 'fixed' ? 'Fixed' : 'Slider'})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                            Select Standalone Banner:
                          </label>
                          <select
                            value={selectedBannerId}
                            onChange={(e) => setSelectedBannerId(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: '#070d1e',
                              border: '1px solid #1e293b',
                              borderRadius: '8px',
                              color: '#ffffff',
                              fontSize: '0.85rem'
                            }}
                          >
                            {allBanners.map(bnr => (
                              <option key={bnr.id} value={bnr.id}>
                                {bnr.title || bnr.name || 'Banner'} (Slot: {bnr.slot}, Page: {bnr.page})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                          Position (Slot Order):
                        </label>
                        <select
                          value={selectedSlotOrder}
                          onChange={(e) => setSelectedSlotOrder(parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#070d1e',
                            border: '1px solid #1e293b',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '0.85rem'
                          }}
                        >
                          {Array.from({ length: Math.max(sections.length + 2, 12) }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>Slot {n} (Position {n})</option>
                          ))}
                        </select>
                        <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '4px 0 0' }}>
                          You can also easily use the Move Up / Down buttons in the section list anytime.
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                        <button
                          type="button"
                          onClick={() => setIsAddBannerSectionOpen(false)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            background: '#1e293b',
                            color: '#cbd5e1',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{
                            padding: '8px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
                          }}
                        >
                          Insert Section to Homepage
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Hero Content & Appearance Editor */}
          {activeTab === 'hero_form' && (
            <form id="hero-banner-editor" onSubmit={handleSaveHero} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{
          background: '#070d1e',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #1e293b' }}>
            <Sparkles size={18} style={{ color: '#fbbf24' }} />
            <span>Primary Hero Banner Content & Styling</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Hero Main Headline *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 14px', color: titleColor, fontSize: '0.88rem', fontWeight: 700, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Badge Pill Text</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 14px', color: badgeColor, fontSize: '0.88rem', fontWeight: 700, outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Hero Subtitle</label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 14px', color: subtitleColor, fontSize: '0.84rem', outline: 'none', resize: 'vertical' }}
            />
          </div>

          {/* Buttons Configuration */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Primary Button Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 14px', color: '#ffffff', fontSize: '0.84rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Primary Button Link</label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 14px', color: '#38bdf8', fontSize: '0.84rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Secondary Button Text</label>
              <input
                type="text"
                value={secondaryCtaText}
                onChange={(e) => setSecondaryCtaText(e.target.value)}
                style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 14px', color: '#ffffff', fontSize: '0.84rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Secondary Button Link</label>
              <input
                type="text"
                value={secondaryCtaLink}
                onChange={(e) => setSecondaryCtaLink(e.target.value)}
                style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 14px', color: '#cbd5e1', fontSize: '0.84rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Image Uploads */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '6px' }}>
            <div style={{ background: '#0b132b', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                Desktop Banner Image (16:5 ratio recommended)
              </span>
              {desktopImage && (
                <img src={desktopImage} alt="Desktop Preview" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
              )}
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                <Upload size={14} />
                <span>{isUploadingDesktop ? 'Uploading...' : 'Upload Desktop Artwork'}</span>
                <input type="file" accept="image/*" onChange={handleUploadDesktop} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ background: '#0b132b', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                Mobile Banner Image (Touch portrait ratio)
              </span>
              {mobileImage && (
                <img src={mobileImage} alt="Mobile Preview" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
              )}
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                <Upload size={14} />
                <span>{isUploadingMobile ? 'Uploading...' : 'Upload Mobile Artwork'}</span>
                <input type="file" accept="image/*" onChange={handleUploadMobile} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                gap: '8px'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving to Database...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>
      </form>
          )}
        </>
      )}
    </div>
  );
};
