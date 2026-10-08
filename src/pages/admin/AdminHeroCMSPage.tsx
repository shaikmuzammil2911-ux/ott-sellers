import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Save, Upload, Check, AlertCircle, RefreshCw, 
  Eye, EyeOff, Layout, ExternalLink, ArrowRight, Palette, 
  ToggleLeft, ToggleRight, Layers, MoveVertical, ShieldCheck, Zap, Image as ImageIcon,
  Edit3
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { HomepageSectionCMS } from '../../types';

const COLOR_PRESETS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Sky Cyan', hex: '#38bdf8' },
  { name: 'Amber Gold', hex: '#fbbf24' },
  { name: 'Emerald', hex: '#34d399' },
  { name: 'Rose Red', hex: '#fb7185' },
  { name: 'Lavender', hex: '#c084fc' }
];

export const AdminHeroCMSPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<HomepageSectionCMS[]>([]);
  const [heroCMS, setHeroCMS] = useState<HomepageSectionCMS | null>(null);

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
      const allSections = await ottApi.getHomepageSections();
      setSections(allSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));

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

    // Sync banner table for hero slider
    try {
      const banners = await ottApi.getAllBannersAdmin();
      if (banners.length > 0) {
        const first = { ...banners[0] };
        first.title = title.trim();
        first.subtitle = subtitle.trim();
        first.badgeText = badgeText.trim();
        first.titleColor = titleColor;
        first.subtitleColor = subtitleColor;
        first.badgeColor = badgeColor;
        first.ctaText = ctaText.trim();
        first.ctaLink = ctaLink.trim();
        first.desktopImage = desktopImage;
        if (mobileImage) first.mobileImage = mobileImage;
        banners[0] = first;
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
            <span>Homepage Section Visibility & CMS</span>
          </h1>
          <p className="admin-sub-text">
            Activate or deactivate homepage sections, set display order, and edit promotional hero content in real-time.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link
            to="/admin/banners"
            className="btn-primary-action"
            style={{ textDecoration: 'none' }}
          >
            <ImageIcon size={16} />
            <span>Promotional Banners Manager</span>
          </Link>
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

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. Section Visibility & Order Management Table */}
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

          <Link
            to="/admin/banners"
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
              padding: '6px 12px',
              borderRadius: '8px'
            }}
          >
            <ImageIcon size={14} />
            <span>Open All Banners</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
          {sections.map((sec) => (
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
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#94a3b8',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  0{sec.displayOrder || 1}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: sec.isActive ? '#ffffff' : '#94a3b8', margin: 0, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sec.name || sec.sectionKey.replace(/_/g, ' ')}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: sec.isActive ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                    {sec.isActive ? '● Live on Store' : '○ Hidden'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {sec.sectionKey === 'hero' && (
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('hero-banner-editor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
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
                  value={sec.displayOrder || 1}
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
                  {[1, 2, 3, 4, 5, 6, 7].map(n => (
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
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {sec.isActive ? 'Turn OFF' : 'Turn ON'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Hero Content & Appearance Editor */}
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving to Database...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
