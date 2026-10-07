import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Save, Upload, Check, AlertCircle, RefreshCw, 
  Eye, Layout, ExternalLink, ArrowRight 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { HomepageSectionCMS } from '../../types';

export const AdminHeroCMSPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroCMS, setHeroCMS] = useState<HomepageSectionCMS | null>(null);

  // Form Fields
  const [badgeText, setBadgeText] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
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
      setHeroCMS(cms);
      setTitle(cms.title || '');
      setSubtitle(cms.subtitle || '');
      setDescription(cms.description || '');
      setBadgeText(cms.settings?.badgeText || 'Your Entertainment, Our Priority');
      setCtaText(cms.settings?.ctaText || 'Shop Now');
      setCtaLink(cms.settings?.ctaLink || '/items');
      setSecondaryCtaText(cms.settings?.secondaryCtaText || 'Explore Categories');
      setSecondaryCtaLink(cms.settings?.secondaryCtaLink || '#categories');
      setDesktopImage(cms.imageUrl || '/hero-bg.png');
      setMobileImage(cms.settings?.mobileImage || '/hero-mobile-1.png');
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
        ctaText: ctaText.trim(),
        ctaLink: ctaLink.trim(),
        secondaryCtaText: secondaryCtaText.trim(),
        secondaryCtaLink: secondaryCtaLink.trim(),
        mobileImage
      },
      isActive: true
    };

    await ottApi.saveHeroSectionCMS(updatedCMS);
    await ottApi.logAudit('UPDATE_HERO_CMS', 'homepage_sections', 'hero', { title: updatedCMS.title });

    setSaving(false);
    setSaveSuccessMsg('Hero Section CMS updated successfully in Supabase! Live website updated.');
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Sparkles className="admin-heading-icon" />
            <span>Hero Section CMS Editor</span>
          </h1>
          <p className="admin-sub-text">
            Edit live hero banner headlines, badges, call-to-action buttons, and desktop/mobile graphics.
          </p>
        </div>

        <div className="admin-header-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-admin-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '12px', fontSize: '0.84rem' }}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layout className="w-5 h-5 text-primary-500" />
            Hero Content Controls
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pill Badge Text</label>
              <input
                type="text"
                placeholder="e.g. Your Entertainment, Our Priority"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Main Heading (H1) *</label>
              <input
                type="text"
                required
                placeholder="All Your Favourite OTT Subscriptions in One Place"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold text-base focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle / Highlight</label>
              <input
                type="text"
                placeholder="Stream 4K Ultra HD on Netflix, Prime Video, Disney+ Hotstar..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Paragraph Description</label>
              <textarea
                rows={3}
                placeholder="Verified 4K streaming accounts with instant WhatsApp credentials delivery..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary CTA URL Link</label>
                <input
                  type="text"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary CTA Label</label>
                <input
                  type="text"
                  value={secondaryCtaText}
                  onChange={(e) => setSecondaryCtaText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary CTA URL Link</label>
                <input
                  type="text"
                  value={secondaryCtaLink}
                  onChange={(e) => setSecondaryCtaLink(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-500 font-mono"
                />
              </div>
            </div>

            {/* Desktop Hero Image */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Desktop Hero Graphic / Banner</label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="text"
                  value={desktopImage}
                  onChange={(e) => setDesktopImage(e.target.value)}
                  className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-primary-500 font-mono"
                />
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-medium cursor-pointer transition-colors flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  {isUploadingDesktop ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadDesktop}
                    disabled={isUploadingDesktop}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Mobile Hero Image */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Hero Graphic (Optional)</label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="text"
                  value={mobileImage}
                  onChange={(e) => setMobileImage(e.target.value)}
                  className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-primary-500 font-mono"
                />
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-medium cursor-pointer transition-colors flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  {isUploadingMobile ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadMobile}
                    disabled={isUploadingMobile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
              </p>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving || isUploadingDesktop || isUploadingMobile}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-primary-600/30 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving to Supabase...' : 'Save & Publish to Live Site'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview: 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              Real-time Hero Preview
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Live Rendering</span>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-700 bg-slate-950 p-6 min-h-[380px] flex flex-col justify-between shadow-2xl">
            {/* Background Image / Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
              style={{ backgroundImage: `url(${getCleanImageUrl(desktopImage)})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

            {/* Preview Content */}
            <div className="relative z-10 space-y-3">
              {badgeText && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/40 text-primary-300 text-xs font-semibold backdrop-blur-md">
                  <Sparkles className="w-3 h-3" />
                  {badgeText}
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {title || 'Headline will appear here'}
              </h2>

              {subtitle && (
                <p className="text-xs text-slate-300 font-medium">
                  {subtitle}
                </p>
              )}

              {description && (
                <p className="text-xs text-slate-400 line-clamp-3">
                  {description}
                </p>
              )}
            </div>

            {/* Buttons Preview */}
            <div className="relative z-10 flex flex-wrap gap-2.5 pt-4">
              <div className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
                {ctaText || 'Shop Now'}
                <ArrowRight className="w-3 h-3" />
              </div>

              {secondaryCtaText && (
                <div className="px-3 py-2 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium">
                  {secondaryCtaText}
                </div>
              )}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-200">✨ How this connects:</div>
            <div>Any changes saved here immediately update the Supabase PostgreSQL database table <code className="text-primary-400 font-mono">homepage_sections</code>, which is fetched by the live website upon reload or live broadcast.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
