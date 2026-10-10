import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, 
  FolderTree, RefreshCw, AlertCircle, Eye, EyeOff, Layers, Hash, Copy,
  ArrowUp, ArrowDown, LayoutGrid, CheckSquare, Square, Info, Sparkles
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { Category, Provider } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => ottApi.getCachedCategoriesAdmin());
  const [providers, setProviders] = useState<Provider[]>([]);
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
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formStatus, setFormStatus] = useState<'ON' | 'OFF'>('ON');
  const [formPlacements, setFormPlacements] = useState<string[]>(['home', 'items']);
  const [formProviderSlug, setFormProviderSlug] = useState<string>('');
  const [formIconName, setFormIconName] = useState('Compass');
  const [formBadgeColor, setFormBadgeColor] = useState('#0284c7');
  const [formImageUrl, setFormImageUrl] = useState('');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, provs] = await Promise.all([
        ottApi.getAllCategoriesAdmin(),
        ottApi.getAllProvidersAdmin()
      ]);
      setCategories(cats.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      setProviders(provs);
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
    setFormShortDescription('');
    setFormDisplayOrder(String(categories.length + 1));
    setFormStatus('ON');
    setFormPlacements(['home', 'items']);
    setFormProviderSlug('');
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
    setFormShortDescription(c.shortDescription || c.description || '');
    setFormDisplayOrder(String(c.displayOrder || 1));
    setFormStatus(c.status || 'ON');
    setFormPlacements(c.placements && c.placements.length > 0 ? c.placements : ['home', 'items']);
    setFormProviderSlug(c.providerSlug || '');
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
      shortDescription: formShortDescription.trim() || formDescription.trim(),
      displayOrder: Number(formDisplayOrder) || 1,
      status: formStatus,
      placements: formPlacements.length > 0 ? formPlacements : ['home', 'items'],
      providerSlug: formProviderSlug || undefined,
      iconName: formIconName,
      badgeColor: formBadgeColor,
      image: formImageUrl.trim(),
      updatedAt: Date.now()
    };

    await ottApi.saveCategory(categoryData);
    await ottApi.logAudit(editingCategory ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY', 'categories', categoryData.id, { 
      name: categoryData.name, 
      slug: categoryData.slug,
      status: categoryData.status 
    });

    showToast(`Category "${categoryData.name}" saved & visibility synced live!`);
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
    showToast(`Category "${c.name}" visibility set to ${newStatus === 'ON' ? 'ACTIVE (Live)' : 'INACTIVE (Hidden)'}.`);
    await loadData();
  };

  const filteredCategories = categories.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
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
            Organize subscriptions into genres, configure descriptions, set order numbers, and control explicit visibility (ON/OFF).
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
            <span>Add Category</span>
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
            placeholder="Search categories by name, slug, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Statuses ({categories.length})</option>
            <option value="ON">Active (ON - {categories.filter(c => c.status === 'ON').length})</option>
            <option value="OFF">Inactive (OFF - {categories.filter(c => c.status === 'OFF').length})</option>
          </select>

          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Placement Slots</option>
            <option value="home">Homepage Placements</option>
            <option value="items">All Subscriptions Page</option>
            <option value="offers">Special Offers Page</option>
          </select>
        </div>
      </div>

      {/* Category Table */}
      <div className="admin-table-container admin-table-wrapper admin-table-scroll">
        <table className="admin-table" style={{ minWidth: '780px' }}>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Order</th>
              <th>Category Name & Description</th>
              <th>Slug</th>
              <th>Display Placements</th>
              <th>Linked Provider</th>
              <th>Visibility Status</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-muted)' }}>
                  No categories found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredCategories.map((c, idx) => (
                <tr key={c.id || c.slug} style={{ opacity: c.status === 'OFF' ? 0.6 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="order-badge">#{c.displayOrder || idx + 1}</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button type="button" onClick={() => handleMoveOrder(c, 'up')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                          <ArrowUp size={11} color="#64748b" />
                        </button>
                        <button type="button" onClick={() => handleMoveOrder(c, 'down')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                          <ArrowDown size={11} color="#64748b" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: 'var(--admin-text-main)', fontSize: '0.92rem' }}>{c.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                        {c.description || c.shortDescription || 'No description provided.'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#64748b' }}>{c.slug}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(c.placements || ['home', 'items']).map(p => (
                        <span key={p} className="placement-pill" style={{ textTransform: 'capitalize' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {c.providerSlug ? (
                      <span className="placement-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
                        {providers.find(p => p.slug === c.providerSlug)?.name || c.providerSlug}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>None</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c)}
                      className={`status-toggle-btn ${c.status === 'ON' ? 'active' : 'inactive'}`}
                      title="Toggle visibility"
                    >
                      {c.status === 'ON' ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{c.status === 'ON' ? 'Active (ON)' : 'Inactive (OFF)'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c)}
                        className="btn-primary-action"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="btn-refresh-action"
                        style={{ color: 'var(--admin-danger)' }}
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

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="admin-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Movies & Series, Live Sports"
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

                {/* Description fields (Requirement 2.2) */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Category Full Description *</label>
                  <textarea
                    className="admin-form-textarea"
                    rows={3}
                    placeholder="Enter detailed description displayed on the Category Page header & search results..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Short Description / Subtitle</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Watch Bollywood, Hollywood & trending series in 4K UHD"
                    value={formShortDescription}
                    onChange={(e) => setFormShortDescription(e.target.value)}
                  />
                </div>

                <div className="admin-form-row-2">
                  {/* Provider Selection (Requirement 3.3) */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Associated Provider (Quick Select)</label>
                    <select
                      className="admin-form-select"
                      value={formProviderSlug}
                      onChange={(e) => setFormProviderSlug(e.target.value)}
                    >
                      <option value="">None / Multiple Providers</option>
                      {providers.map(p => (
                        <option key={p.slug} value={p.slug}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Display Order (#)</label>
                    <input
                      type="number"
                      min="1"
                      className="admin-form-input"
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(e.target.value)}
                    />
                  </div>
                </div>

                {/* Where should this category appear? (Requirement 2.1) */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label className="admin-form-label" style={{ fontWeight: 800, marginBottom: '8px' }}>
                    Where Should This Category Appear?
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'home', label: 'Homepage Strip' },
                      { key: 'items', label: 'All Subscriptions Page' },
                      { key: 'offers', label: 'Special Offers Strip' }
                    ].map(loc => (
                      <button
                        type="button"
                        key={loc.key}
                        onClick={() => handleTogglePlacement(loc.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: formPlacements.includes(loc.key) ? 'rgba(2, 132, 199, 0.15)' : '#ffffff',
                          border: `1.5px solid ${formPlacements.includes(loc.key) ? '#0284c7' : '#cbd5e1'}`,
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: formPlacements.includes(loc.key) ? '#0284c7' : '#475569',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {formPlacements.includes(loc.key) ? <CheckSquare size={14} color="#0284c7" /> : <Square size={14} color="#94a3b8" />}
                        <span>{loc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Status (Requirement 2.1) */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Category Visibility Status</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setFormStatus('ON')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: formStatus === 'ON' ? '#10b981' : '#f8fafc',
                        color: formStatus === 'ON' ? '#ffffff' : '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={14} /> ON (Visible on Website)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus('OFF')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: formStatus === 'OFF' ? '#dc2626' : '#f8fafc',
                        color: formStatus === 'OFF' ? '#ffffff' : '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} /> OFF (Hidden from Website)
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-modal-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-primary"
                >
                  <Check size={14} />
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
