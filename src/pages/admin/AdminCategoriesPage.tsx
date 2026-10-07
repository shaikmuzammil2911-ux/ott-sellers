import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  FolderTree, RefreshCw, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => ottApi.getCachedCategoriesAdmin());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formBadgeColor, setFormBadgeColor] = useState('#0284c7');
  const [formTitlesCount, setFormTitlesCount] = useState('10+ Plans');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formStatus, setFormStatus] = useState<'ON' | 'OFF'>('ON');

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const cats = await ottApi.getAllCategoriesAdmin();
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = (e: any) => {
      if (!e?.detail || e.detail.entityType === 'categories') {
        setCategories(ottApi.getCachedCategoriesAdmin());
      }
    };
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImageUrl('');
    setFormBadgeColor('#0284c7');
    setFormTitlesCount('12+ Plans');
    setFormDisplayOrder(String(categories.length + 1));
    setFormStatus('ON');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormSlug(c.slug);
    setFormDescription(c.description || '');
    setFormImageUrl(c.image || '');
    setFormBadgeColor(c.badgeColor || '#0284c7');
    setFormTitlesCount(c.titlesCount || '10+ Plans');
    setFormDisplayOrder(String(c.displayOrder || 1));
    setFormStatus(c.status || 'ON');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const res = await uploadService.uploadImage(file, 'categories');
    setIsUploading(false);

    if (res.success && res.url) {
      setFormImageUrl(res.url);
    } else {
      setUploadError(res.error || 'Failed to upload image. Please try again or paste image URL.');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Category name is required');
      return;
    }

    const slug = formSlug.trim()
      ? formSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const categoryData: Category = {
      id: editingCategory?.id || 'cat-' + Date.now(),
      name: formName.trim(),
      slug,
      description: formDescription.trim(),
      shortDescription: formDescription.trim(),
      image: formImageUrl || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=60',
      iconName: editingCategory?.iconName || 'Compass',
      badgeColor: formBadgeColor || '#0284c7',
      bgGradient: editingCategory?.bgGradient || 'linear-gradient(135deg, #070d1e 0%, #0b132b 100%)',
      titlesCount: formTitlesCount || '10+ Plans',
      displayOrder: Number(formDisplayOrder) || 1,
      status: formStatus,
      updatedAt: Date.now()
    };

    // 1. Immediately save to API (which saves to cache and broadcasts live update)
    await ottApi.saveCategory(categoryData);
    await ottApi.logAudit(editingCategory ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY', 'categories', categoryData.id, { name: categoryData.name, slug: categoryData.slug });

    // 2. Immediately update state from fresh cache
    setCategories(ottApi.getCachedCategoriesAdmin());

    setSaveSuccessMsg(`Category "${categoryData.name}" saved! Directly visible in admin panel and live website.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete category "${name}"?`)) {
      setCategories(prev => prev.filter(c => c.id !== id));
      await ottApi.deleteCategory(id);
      await ottApi.logAudit('DELETE_CATEGORY', 'categories', id, { name });
      await loadData();
    }
  };

  const handleToggleStatus = async (c: Category) => {
    const newStatus = c.status === 'ON' ? 'OFF' : 'ON';
    const updated: Category = { ...c, status: newStatus };
    setCategories(prev => prev.map(item => item.id === c.id ? updated : item));
    await ottApi.saveCategory(updated);
    await ottApi.logAudit('TOGGLE_CATEGORY_STATUS', 'categories', c.id, { status: newStatus });
    await loadData();
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <FolderTree className="admin-heading-icon" />
            <span>Categories Management</span>
          </h1>
          <p className="admin-sub-text">
            Organize subscription collections, movies, sports, music, and combo categories linked to Supabase.
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
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-count-badge">
          Total Categories: <strong>{filteredCategories.length}</strong>
        </div>
      </div>

      {/* Categories Grid / Table */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Plans / Subtitle</th>
                <th>Sort Order</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                    Loading categories from Supabase...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getCleanImageUrl(c.image, c.updatedAt)}
                          alt={c.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-700/80 bg-slate-800 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=60';
                          }}
                        />
                        <div>
                          <div className="font-bold text-white text-base leading-snug">{c.name}</div>
                          <div className="text-xs text-slate-400 line-clamp-1 max-w-xs mt-0.5">{c.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-primary-400">
                      /{c.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700">
                        {c.titlesCount || 'Multiple Plans'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-300">
                      #{c.displayOrder || 1}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          c.status === 'ON'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        {c.status === 'ON' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {c.status === 'ON' ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderTree size={20} style={{ color: '#0284c7' }} />
                <span>{editingCategory ? 'Edit Category' : 'Add New Category'}</span>
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

            <form onSubmit={handleSaveCategory} className="admin-form-grid">
              <div className="admin-form-group admin-form-full">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Movies & TV Shows"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>URL Slug (auto-generated if empty)</label>
                <input
                  type="text"
                  placeholder="movies-tv-shows"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Display / Sort Order</label>
                <input
                  type="number"
                  min="1"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(e.target.value)}
                />
              </div>

              <div className="admin-form-group admin-form-full">
                <label>Badge / Plans Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. 10+ Streaming Plans"
                  value={formTitlesCount}
                  onChange={(e) => setFormTitlesCount(e.target.value)}
                />
              </div>

              <div className="admin-form-group admin-form-full">
                <label>Category Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description displayed on category cards..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Category Image Upload & URL */}
              <div className="admin-form-group admin-form-full">
                <label>Category Image / Banner *</label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Paste image URL or upload image file..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
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

              <div className="admin-form-group">
                <label>Accent / Badge Color</label>
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
                <label>Display Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'ON' | 'OFF')}
                >
                  <option value="ON">Active (Visible)</option>
                  <option value="OFF">Disabled (Hidden)</option>
                </select>
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
                  <span>Save Category to Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
