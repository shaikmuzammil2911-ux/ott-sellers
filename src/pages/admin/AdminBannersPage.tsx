import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  Image as ImageIcon, RefreshCw, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { HeroBanner } from '../../types';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('');
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

    await ottApi.saveBanners(updated);
    await ottApi.logAudit(editingBanner ? 'UPDATE_BANNER' : 'CREATE_BANNER', 'banners', bannerData.id, { title: bannerData.title });

    setSaveSuccessMsg(`Banner "${bannerData.title || 'Promotional Banner'}" saved successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this banner?')) {
      await ottApi.deleteBanner(id);
      await ottApi.logAudit('DELETE_BANNER', 'banners', id);
      await loadData();
    }
  };

  const handleToggleStatus = async (b: HeroBanner) => {
    const newStatus = b.status === 'ON' ? 'OFF' : 'ON';
    const updated = banners.map(item => item.id === b.id ? { ...item, status: newStatus as any } : item);
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
            Manage top carousel banners, promo advertisements, and sale announcements.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
            Loading banners from Supabase...
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No promotional banners found. Click &quot;Add Banner&quot; above to create one.
          </div>
        ) : (
          banners.map((b) => (
            <div 
              key={b.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/7] bg-slate-950 overflow-hidden">
                <img
                  src={getCleanImageUrl(b.desktopImage, b.updatedAt)}
                  alt={b.title || 'Banner'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/hero-bg.png';
                  }}
                />
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/10">
                    #{b.displayOrder || 1}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(b)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border backdrop-blur-md transition-colors ${
                      b.status === 'ON'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {b.status === 'ON' ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2 flex-1">
                {b.badgeText && (
                  <span className="inline-block px-2 py-0.5 bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded text-[10px] font-semibold">
                    {b.badgeText}
                  </span>
                )}
                <h3 className="font-bold text-white text-base leading-snug line-clamp-1">
                  {b.title || 'Image-Only Banner'}
                </h3>
                {b.subtitle && (
                  <p className="text-xs text-slate-400 line-clamp-2">{b.subtitle}</p>
                )}
                <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80">
                  <span className="truncate max-w-[150px]">Link: <code className="text-primary-400 font-mono">{b.ctaLink}</code></span>
                  <span>Button: <strong>{b.ctaText}</strong></span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-950/40 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(b)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteBanner(b.id)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary-500" />
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Title</label>
                <input
                  type="text"
                  placeholder="e.g. MEGA CRICKET LEAGUE PASS"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle / Promo Note</label>
                <input
                  type="text"
                  placeholder="Watch live matches in 4K with instant private credentials"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. FLASH SALE 80% OFF"
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Carousel Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Button Link URL</label>
                  <input
                    type="text"
                    value={formCtaLink}
                    onChange={(e) => setFormCtaLink(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>
              </div>

              {/* Desktop Image */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Desktop Banner Graphic *</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {formDesktopImage && (
                    <img
                      src={formDesktopImage}
                      alt="Preview"
                      className="w-24 h-12 object-cover rounded-xl border border-slate-700 bg-slate-800 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      placeholder="Paste image URL or upload to Cloudinary..."
                      value={formDesktopImage}
                      onChange={(e) => setFormDesktopImage(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-primary-500"
                    />
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-medium cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {isUploading ? 'Uploading...' : 'Upload Image File'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                {uploadError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'ON' | 'OFF')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="ON">Active (Visible)</option>
                  <option value="OFF">Disabled</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Banner to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
