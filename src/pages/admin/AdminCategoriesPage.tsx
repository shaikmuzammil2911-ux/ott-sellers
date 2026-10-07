import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  FolderTree, RefreshCw, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
      setUploadError(res.error || 'Failed to upload image. Please try again.');
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
      badgeColor: formBadgeColor,
      titlesCount: formTitlesCount,
      displayOrder: Number(formDisplayOrder) || 1,
      status: formStatus,
      updatedAt: Date.now()
    };

    await ottApi.saveCategory(categoryData);
    await ottApi.logAudit(editingCategory ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY', 'categories', categoryData.id, { name: categoryData.name, slug: categoryData.slug });

    setSaveSuccessMsg(`Category "${categoryData.name}" saved successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete category "${name}"?`)) {
      await ottApi.deleteCategory(id);
      await ottApi.logAudit('DELETE_CATEGORY', 'categories', id, { name });
      await loadData();
    }
  };

  const handleToggleStatus = async (c: Category) => {
    const newStatus = c.status === 'ON' ? 'OFF' : 'ON';
    const updated: Category = { ...c, status: newStatus };
    await ottApi.saveCategory(updated);
    await ottApi.logAudit('TOGGLE_CATEGORY_STATUS', 'categories', c.id, { status: newStatus });
    await loadData();
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <FolderTree className="admin-heading-icon" />
            <span>Categories Management</span>
          </h1>
          <p className="admin-sub-text">
            Organize subscription collections, movies, sports, music, and combo categories.
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
            placeholder="Search categories..."
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
              {loading ? (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-primary-500" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Movies & TV Shows"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="movies-series"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display / Sort Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Badge / Plans Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. 10+ Streaming Plans"
                  value={formTitlesCount}
                  onChange={(e) => setFormTitlesCount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description shown on category cards..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Category Image */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Image / Banner</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-700 bg-slate-800 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      placeholder="Paste image URL or upload file..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-primary-500"
                    />
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-medium cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {isUploading ? 'Uploading to Cloudinary...' : 'Upload Image File'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Accent / Badge Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formBadgeColor}
                      onChange={(e) => setFormBadgeColor(e.target.value)}
                      className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formBadgeColor}
                      onChange={(e) => setFormBadgeColor(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'ON' | 'OFF')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="ON">Active (Visible)</option>
                    <option value="OFF">Hidden</option>
                  </select>
                </div>
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
                  Save Category to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
