import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, 
  FolderTree, RefreshCw, AlertCircle, Eye, EyeOff, Layers, Hash, Copy 
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => ottApi.getCachedCategoriesAdmin());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formStatus, setFormStatus] = useState<'ON' | 'OFF'>('ON');
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

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormDisplayOrder(String(categories.length + 1));
    setFormStatus('ON');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormSlug(c.slug);
    setFormDescription(c.description || '');
    setFormDisplayOrder(String(c.displayOrder || 1));
    setFormStatus(c.status || 'ON');
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingCategory) {
      const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormSlug(autoSlug);
    }
  };

  const handleDuplicate = async (c: Category) => {
    try {
      const copy = await ottApi.duplicateCategory(c.id);
      showToast(`Category "${c.name}" duplicated as "${copy.name}"!`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate category');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Category name is required.');
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
      displayOrder: Number(formDisplayOrder) || 1,
      status: formStatus,
      updatedAt: Date.now()
    };

    await ottApi.saveCategory(categoryData);
    await ottApi.logAudit(editingCategory ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY', 'categories', categoryData.id, { 
      name: categoryData.name, 
      slug: categoryData.slug 
    });

    showToast(`Category "${categoryData.name}" saved to database and live on website!`);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete category "${name}"? This action cannot be undone.`)) {
      await ottApi.deleteCategory(id);
      await ottApi.logAudit('DELETE_CATEGORY', 'categories', id, { name });
      showToast(`Category "${name}" deleted.`);
      await loadData();
    }
  };

  const handleToggleStatus = async (c: Category) => {
    const newStatus: 'ON' | 'OFF' = c.status === 'ON' ? 'OFF' : 'ON';
    const updated = { ...c, status: newStatus, updatedAt: Date.now() };
    await ottApi.saveCategory(updated);
    showToast(`Category is now ${newStatus === 'ON' ? 'ACTIVE' : 'INACTIVE'}.`);
    await loadData();
  };

  const filteredCategories = categories.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (statusFilter === 'ON' && c.status !== 'ON') return false;
    if (statusFilter === 'OFF' && c.status !== 'OFF') return false;
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <FolderTree className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Category Management</span>
          </h1>
          <p className="admin-sub-text">
            Organize OTT subscriptions and services into curated streaming categories.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh categories"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary-action"
          >
            <Plus size={16} />
            <span>Create New Category</span>
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
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-select-filter"
        >
          <option value="all">All Statuses</option>
          <option value="ON">Active Only</option>
          <option value="OFF">Inactive Only</option>
        </select>
      </div>

      {/* Categories Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Category Name</th>
              <th>URL Slug</th>
              <th>Description</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-muted)' }}>
                  No categories found. Click <strong>+ Create New Category</strong> to add one.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id || cat.slug}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--admin-text-muted)' }}>
                      #{cat.displayOrder || 1}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--admin-text-main)', fontSize: '0.9rem' }}>
                      {cat.name}
                    </strong>
                  </td>
                  <td>
                    <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.76rem', color: 'var(--admin-primary)' }}>
                      {cat.slug}
                    </code>
                  </td>
                  <td style={{ maxWidth: '280px', color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>
                    {cat.description || 'No description provided'}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(cat)}
                      className={`admin-badge ${cat.status === 'ON' ? 'active' : 'inactive'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to toggle status"
                    >
                      {cat.status === 'ON' ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{cat.status === 'ON' ? 'ACTIVE' : 'INACTIVE'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(cat)}
                        className="btn-refresh-action"
                        title="Duplicate category"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cat)}
                        className="btn-primary-action"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        title="Edit category"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="btn-refresh-action"
                        style={{ color: 'var(--admin-danger)' }}
                        title="Delete category"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCategory ? `Edit Category (${editingCategory.name})` : 'Create New Category'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="admin-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Category Name *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Movies & TV Shows"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">URL Slug (e.g. movies-tv-shows)</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="movies-tv-shows"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description (Optional)</label>
                  <textarea
                    className="admin-form-textarea"
                    rows={3}
                    placeholder="Short description for SEO and category preview"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Display Order</label>
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
                      <option value="ON">Active (ON - Displayed on Storefront)</option>
                      <option value="OFF">Inactive (OFF - Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-refresh-action"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                >
                  <Check size={16} />
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
