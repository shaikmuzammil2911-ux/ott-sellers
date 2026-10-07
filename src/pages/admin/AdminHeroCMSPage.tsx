import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Save, Upload, Check, AlertCircle, RefreshCw, 
  Eye, Layout, ExternalLink, ArrowRight, Palette
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
  const [heroCMS, setHeroCMS] = useState<HomepageSectionCMS | null>(null);

  // Form Fields
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
      const cms = await ottApi.getHeroSectionCMS();
      if (cms) {
        setHeroCMS(cms);
        setTitle(cms.title || 'All Your Favourite OTT Subscriptions in One Place');
        setSubtitle(cms.subtitle || '');
        setDescription(cms.description || '');
        setBadgeText(cms.settings?.badgeText || 'Your Entertainment, Our Priority');
        setBadgeColor(cms.settings?.badgeColor || '#38bdf8');
        setTitleColor(cms.settings?.titleColor || '#ffffff');
        setSubtitleColor(cms.settings?.subtitleColor || '#cbd5e1');
        setCtaText(cms.settings?.ctaText || 'Shop Now');
        setCtaLink(cms.settings?.ctaLink || '/items');
        setSecondaryCtaText(cms.settings?.secondaryCtaText || 'Explore Categories');
        setSecondaryCtaLink(cms.settings?.secondaryCtaLink || '#categories');
        setDesktopImage(cms.imageUrl || '/hero-bg.png');
        setMobileImage(cms.settings?.mobileImage || '/hero-mobile-1.png');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg(null);

    const updatedCMS: HomepageSectionCMS = {
      id: heroCMS?.id || 'sec-hero',
      sectionKey: 'hero',
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      imageUrl: desktopImage,
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
      isActive: true
    };

    // Save CMS section
    await ottApi.saveHeroSectionCMS(updatedCMS);

    // Also sync the primary banner so HeroSection immediately displays the updated text & colors
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
    } catch (err) {
      console.warn('Banner sync notice:', err);
    }

    await ottApi.logAudit('UPDATE_HERO_CMS', 'homepage_sections', 'hero', { title: updatedCMS.title });

    setSaving(false);
    setSaveSuccessMsg('Hero Section CMS & Text Colors saved successfully to Supabase! Live website updated.');
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Sparkles className="admin-heading-icon" />
            <span>Hero Section CMS & Text Colors</span>
          </h1>
          <p className="admin-sub-text">
            Customize hero headlines, text colors, badge accents, call-to-action buttons, and graphics with live preview.
          </p>
        </div>

        <div className="admin-header-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-admin-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', fontSize: '0.84rem' }}
          >
            <ExternalLink size={14} />
            <span>View Live Site</span>
          </a>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Reload from Supabase"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Editor & Live Preview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Left Form */}
        <div
          style={{
            background: '#070d1e',
            border: '1px solid #1e293b',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, paddingBottom: '14px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layout size={18} style={{ color: '#0284c7' }} />
            <span>Hero Content & Text Color Controls</span>
          </h2>

          <form onSubmit={handleSave} className="admin-form-grid" style={{ gap: '16px' }}>
            {/* Pill Badge */}
            <div className="admin-form-group">
              <label>Pill Badge Text</label>
              <input
                type="text"
                placeholder="e.g. Your Entertainment, Our Priority"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
              />
            </div>

            {/* Badge Text Color */}
            <div className="admin-form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={14} style={{ color: '#38bdf8' }} />
                <span>Badge Color</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={badgeColor}
                  onChange={(e) => setBadgeColor(e.target.value)}
                  style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', background: 'transparent' }}
                />
                <input
                  type="text"
                  value={badgeColor}
                  onChange={(e) => setBadgeColor(e.target.value)}
                  style={{ flex: 1, fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Main Heading H1 */}
            <div className="admin-form-group admin-form-full">
              <label>Main Headline (H1) *</label>
              <input
                type="text"
                required
                placeholder="All Your Favourite OTT Subscriptions in One Place"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ fontSize: '1rem', fontWeight: 700 }}
              />
            </div>

            {/* Title Color */}
            <div className="admin-form-group admin-form-full">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={14} style={{ color: '#38bdf8' }} />
                <span>Heading Text Color</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                  <input
                    type="color"
                    value={titleColor}
                    onChange={(e) => setTitleColor(e.target.value)}
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', background: 'transparent' }}
                  />
                  <input
                    type="text"
                    value={titleColor}
                    onChange={(e) => setTitleColor(e.target.value)}
                    style={{ flex: 1, fontFamily: 'monospace' }}
                  />
                </div>
                {/* Color quick presets */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setTitleColor(p.hex)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#1e293b',
                        border: titleColor === p.hex ? '2px solid #38bdf8' : '1px solid #334155',
                        color: p.hex,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <div className="admin-form-group admin-form-full">
              <label>Subtitle / Feature Summary</label>
              <input
                type="text"
                placeholder="Stream 4K Ultra HD on Netflix, Prime Video..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            {/* Subtitle Color */}
            <div className="admin-form-group admin-form-full">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={14} style={{ color: '#38bdf8' }} />
                <span>Subtitle Text Color</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                  <input
                    type="color"
                    value={subtitleColor}
                    onChange={(e) => setSubtitleColor(e.target.value)}
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', background: 'transparent' }}
                  />
                  <input
                    type="text"
                    value={subtitleColor}
                    onChange={(e) => setSubtitleColor(e.target.value)}
                    style={{ flex: 1, fontFamily: 'monospace' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setSubtitleColor(p.hex)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#1e293b',
                        border: subtitleColor === p.hex ? '2px solid #38bdf8' : '1px solid #334155',
                        color: p.hex,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="admin-form-group">
              <label>Primary Button Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Primary Button Link</label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Secondary Button Text</label>
              <input
                type="text"
                value={secondaryCtaText}
                onChange={(e) => setSecondaryCtaText(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Secondary Button Link</label>
              <input
                type="text"
                value={secondaryCtaLink}
                onChange={(e) => setSecondaryCtaLink(e.target.value)}
              />
            </div>

            {/* Desktop Hero Image */}
            <div className="admin-form-group admin-form-full">
              <label>Desktop Hero Image Banner</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={desktopImage}
                  onChange={(e) => setDesktopImage(e.target.value)}
                  style={{ flex: 1, minWidth: '220px' }}
                />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1e293b', padding: '10px 14px', borderRadius: '10px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <Upload size={14} />
                  <span>{isUploadingDesktop ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadDesktop}
                    disabled={isUploadingDesktop}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {/* Mobile Hero Image */}
            <div className="admin-form-group admin-form-full">
              <label>Mobile Hero Image (Optimized for Small Screens)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={mobileImage}
                  onChange={(e) => setMobileImage(e.target.value)}
                  style={{ flex: 1, minWidth: '220px' }}
                />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1e293b', padding: '10px 14px', borderRadius: '10px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <Upload size={14} />
                  <span>{isUploadingMobile ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadMobile}
                    disabled={isUploadingMobile}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {uploadError && (
              <div className="admin-form-full" style={{ color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} /> {uploadError}
              </div>
            )}

            <div className="admin-modal-actions admin-form-full" style={{ paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
              <button
                type="submit"
                disabled={saving || isUploadingDesktop || isUploadingMobile}
                className="btn-primary-action"
                style={{ padding: '12px 28px', fontSize: '0.92rem' }}
              >
                <Save size={16} />
                <span>{saving ? 'Publishing to Supabase...' : 'Save & Publish Live'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={16} style={{ color: '#10b981' }} />
              <span>Real-time Hero Preview</span>
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>Live Colors & Layout</span>
          </div>

          <div
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid #1e293b',
              background: '#020617',
              padding: '28px',
              minHeight: '380px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
            }}
          >
            {/* Background Image / Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${getCleanImageUrl(desktopImage)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.35
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #020617 15%, rgba(2,6,23,0.7) 60%, transparent 100%)'
              }}
            />

            {/* Content Preview */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {badgeText && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    background: 'rgba(56,189,248,0.12)',
                    border: `1px solid ${badgeColor}`,
                    color: badgeColor,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    width: 'fit-content'
                  }}
                >
                  <Sparkles size={13} />
                  <span>{badgeText}</span>
                </div>
              )}

              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: titleColor,
                  lineHeight: 1.25,
                  margin: 0
                }}
              >
                {title || 'Headline will appear here'}
              </h2>

              {subtitle && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: subtitleColor,
                    margin: 0,
                    lineHeight: 1.5
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Buttons Preview */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '16px' }}>
              <div
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{ctaText || 'Shop Now'}</span>
                <ArrowRight size={14} />
              </div>

              {secondaryCtaText && (
                <div
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'rgba(30,41,59,0.8)',
                    border: '1px solid #334155',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  {secondaryCtaText}
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '16px', background: '#070d1e', border: '1px solid #1e293b', borderRadius: '14px', fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.5 }}>
            <strong style={{ color: '#f8fafc' }}>⚡ Instant Live Sync:</strong> When saved, changes are stored in Supabase table <code style={{ color: '#38bdf8' }}>homepage_sections</code> & <code style={{ color: '#38bdf8' }}>banners</code> and instantly broadcasted to active visitors on the live storefront.
          </div>
        </div>
      </div>
    </div>
  );
};
