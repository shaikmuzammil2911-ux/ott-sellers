import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, 
  FolderTree, RefreshCw, AlertCircle, Eye, EyeOff, Layers, Hash, Copy,
  ArrowUp, ArrowDown, LayoutGrid, CheckSquare, Square, Info
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => ottApi.getCachedCategoriesAdmin());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formStatus, setFormStatus] = useState<'ON' | 'OFF'>('ON');
  const [formPlacements, setFormPlacements] = useState<string[]>(['home', 'items']);
  const [formIconName, setFormIconName] = useState('Compass');
  const [formBadgeColor, setFormBadgeColor] = useState('#0284c7');
  const [formImageUrl, setFormImageUrl] = useState('');

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
    setFormPlacements(['home', 'items']);
    setFormIconName('Compass');
    setFormBadgeColor('#0284c7');
    setFormImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormSlug(c.slug);
    setFormDescription(c.description || '');
    setFormDisplayOrder(String(c.displayOrder || 1));
    setFormStatus(c.status || 'ON');
    setFormPlacements(c.placements && c.placements.length > 0 ? c.placements : ['home', 'items']);
    setFormIconName(c.iconName || 'Compass');
    setFormBadgeColor(c.badgeColor || '#0284c7');
    setFormImageUrl(c.image || '');
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingCategory) {
      const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormSlug(autoSlug);
    }
  };

  const handleTogglePlacement = (loc: string) => {
    if (formPlacements.includes(loc)) {
      setFormPlacements(formPlacements.filter(p => p !== loc));
    } else {
      setFormPlacements([...formPlacements, loc]);
    }
  };

  const handleMoveOrder = async (c: Category, direction: 'up' | 'down') => {
    const currentOrder = c.displayOrder || 1;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    const updated = { ...c, displayOrder: newOrder, updatedAt: Date.now() };
    await ottApi.saveCategory(updated);
    showToast(`Category order updated to #${newOrder}`);
    await loadData();
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
      placements: formPlacements.length > 0 ? formPlacements : ['home', 'items'],
      iconName: formIconName,
      badgeColor: formBadgeColor,
      image: formImageUrl.trim(),
      updatedAt: Date.now()
    };

    await ottApi.saveCategory(categoryData);
    await ottApi.logAudit(editingCategory ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY', 'categories', categoryData.id, { 
      name: categoryData.name, 
      slug: categoryData.slug 
    });

    showToast(`Category "${categoryData.name}" saved & synced with live website!`);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"? Products in this category will be preserved safely.`)) {
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
    showToast(`Category "${c.name}" is now ${newStatus === 'ON' ? 'Active' : 'Inactive'}.`);
    await loadData();
  };

  const filteredCategories = categories.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (statusFilter === 'ON' && c.status !== 'ON') return false;
    if (statusFilter === 'OFF' && c.status !== 'OFF') return false;
    if (placementFilter !== 'all') {
      const placements = c.placements || ['home', 'items'];
      if (!placements.includes(placementFilter)) return false;
    }
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <FolderTree className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Category Management & Placement CMS</span>
          </h1>
          <p className="admin-sub-text">
            Organize subscriptions into streaming categories, set order numbers externally, and select display locations (Home, Items, Offers).
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

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Placement Locations</option>
            <option value="home">Home Page Strip</option>
            <option value="items">Items Page</option>
            <option value="offers">Special Offers Page</option>
          </select>

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
      </div>

      {/* Categories List Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Display Order</th>
              <th>Category Name</th>
              <th>URL Slug</th>
              <th>Where Placed</th>
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
                  {/* Requirement 5.A: External Order Control */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '32px', 
                        height: '32px', 
                        background: '#070d1e', 
                        border: '1px solid #1e293b', 
                        borderRadius: '6px', 
                        color: '#38bdf8', 
                        fontWeight: 800,
                        fontSize: '0.86rem' 
                      }}>
                        #{cat.displayOrder || 1}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(cat, 'up')}
                          className="btn-refresh-action"
                          style={{ padding: '2px 4px' }}
                          title="Move Order Up"
                        >
                          <ArrowUp size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(cat, 'down')}
                          className="btn-refresh-action"
                          style={{ padding: '2px 4px' }}
                          title="Move Order Down"
                        >
                          <ArrowDown size={10} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.badgeColor || '#0284c7' }} />
                      <strong style={{ color: 'var(--admin-text-main)', fontSize: '0.9rem' }}>
                        {cat.name}
                      </strong>
                    </div>
                  </td>
                  <td>
                    <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.76rem', color: 'var(--admin-primary)' }}>
                      {cat.slug}
                    </code>
                  </td>
                  {/* Requirement 5.B: Placements Badges */}
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(cat.placements || ['home', 'items']).map(p => (
                        <span key={p} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', textTransform: 'capitalize' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(cat)}
                      className={`admin-badge ${cat.status === 'ON' ? 'active' : 'inactive'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {cat.status === 'ON' ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{cat.status === 'ON' ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cat)}
                        className="btn-primary-action"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '640px' }}>
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
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Movies & Series"
                      value={formName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">URL Slug *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. movies-series"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    rows={2}
                    className="admin-form-input"
                    placeholder="Brief description for customer view..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                {/* Requirement 5.B: Where Should This Category Appear? */}
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                  <label className="admin-form-label" style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '8px' }}>
                    Where Should This Category Appear?
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                    {[
                      { key: 'home', label: 'Home Page' },
                      { key: 'items', label: 'Items / Subscriptions' },
                      { key: 'offers', label: 'Special Offers' }
                    ].map(loc => (
                      <button
                        type="button"
                        key={loc.key}
                        onClick={() => handleTogglePlacement(loc.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: formPlacements.includes(loc.key) ? 'rgba(56, 189, 248, 0.15)' : '#0b132b',
                          border: `1px solid ${formPlacements.includes(loc.key) ? '#38bdf8' : '#1e293b'}`,
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: formPlacements.includes(loc.key) ? '#ffffff' : '#cbd5e1',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {formPlacements.includes(loc.key) ? <CheckSquare size={14} color="#38bdf8" /> : <Square size={14} color="#64748b" />}
                        <span>{loc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Display Order Number</label>
                    <input
                      type="number"
                      min="1"
                      className="admin-form-input"
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Publication Status</label>
                    <select
                      className="admin-form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                    >
                      <option value="ON">Active (ON - Display publicly)</option>
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
