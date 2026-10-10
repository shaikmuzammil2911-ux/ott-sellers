import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, 
  Sparkles, RefreshCw, AlertCircle, Eye, EyeOff, Layers, Hash, Copy,
  ArrowUp, ArrowDown, LayoutGrid, CheckSquare, Square, Info, ShieldCheck, Upload
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { Provider, Category } from '../../types';

const PRESET_BRAND_COLORS = [
  { name: 'Amazon Cyan', hex: '#00A8E1' },
  { name: 'Netflix Red', hex: '#E50914' },
  { name: 'Spotify Green', hex: '#1DB954' },
  { name: 'Disney Blue', hex: '#0C3B8A' },
  { name: 'ZEE5 Purple', hex: '#8E24AA' },
  { name: 'Sony Gold/Black', hex: '#F59E0B' },
  { name: 'Hotstar Deep Blue', hex: '#113CCF' },
  { name: 'Apple Gray', hex: '#475569' }
];

export const AdminProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>(() => ottApi.getCachedProvidersAdmin());
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategorySlug, setFormCategorySlug] = useState('movies-series');
  const [formLogo, setFormLogo] = useState('');
  const [formBrandColor, setFormBrandColor] = useState('#0284c7');
  const [formDescription, setFormDescription] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formIsActive, setFormIsActive] = useState(true);

  // Upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [provs, cats] = await Promise.all([
        ottApi.getAllProvidersAdmin(),
        ottApi.getAllCategoriesAdmin()
      ]);
      setProviders(provs.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
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
    setEditingProvider(null);
    setFormName('');
    setFormSlug('');
    setFormCategorySlug(categories[0]?.slug || 'movies-series');
    setFormLogo('');
    setFormBrandColor('#0284c7');
    setFormDescription('');
    setFormDisplayOrder(String(providers.length + 1));
    setFormIsActive(true);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Provider) => {
    setEditingProvider(p);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormCategorySlug(p.categorySlug || 'movies-series');
    setFormLogo(p.logo || '');
    setFormBrandColor(p.brandColor || '#0284c7');
    setFormDescription(p.description || '');
    setFormDisplayOrder(String(p.displayOrder || 1));
    setFormIsActive(p.isActive);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingProvider) {
      const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormSlug(autoSlug);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setUploadError(null);

    try {
      const res = await uploadService.uploadImage(file, 'providers');
      if (res.success && res.url) {
        setFormLogo(res.url);
      } else {
        setUploadError(res.error || 'Failed to upload provider logo');
      }
    } catch {
      setUploadError('Failed to upload provider logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Provider name is required.');
      return;
    }

    const slug = formSlug.trim()
      ? formSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const providerData: Provider = {
      id: editingProvider?.id || 'prov-' + Date.now(),
      name: formName.trim(),
      slug,
      categorySlug: formCategorySlug,
      logo: formLogo.trim(),
      brandColor: formBrandColor,
      description: formDescription.trim(),
      displayOrder: Number(formDisplayOrder) || 1,
      isActive: formIsActive,
      updatedAt: Date.now()
    };

    await ottApi.saveProvider(providerData);
    await ottApi.logAudit(editingProvider ? 'UPDATE_PROVIDER' : 'CREATE_PROVIDER', 'providers', providerData.id, { 
      name: providerData.name, 
      slug: providerData.slug 
    });

    showToast(`Provider "${providerData.name}" saved & Quick Select updated on live store!`);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteProvider = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete Provider "${name}"? Products mapped to this provider will be preserved safely.`)) {
      await ottApi.deleteProvider(id);
      await ottApi.logAudit('DELETE_PROVIDER', 'providers', id, { name });
      showToast(`Provider "${name}" deleted.`);
      await loadData();
    }
  };

  const handleToggleStatus = async (p: Provider) => {
    const updated: Provider = { ...p, isActive: !p.isActive, updatedAt: Date.now() };
    await ottApi.saveProvider(updated);
    showToast(`Provider "${p.name}" is now ${updated.isActive ? 'Active (Visible in Quick Select)' : 'Inactive'}.`);
    await loadData();
  };

  const filteredProviders = providers.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (statusFilter === 'active' && !p.isActive) return false;
    if (statusFilter === 'inactive' && p.isActive) return false;
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Sparkles className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Central Provider Management (Quick Select)</span>
          </h1>
          <p className="admin-sub-text">
            Manage OTT providers (Amazon, Netflix, Disney+, Spotify, etc.), order numbers, logos, brand colors, and customer-facing Quick Select availability.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh providers"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary-action"
          >
            <Plus size={16} />
            <span>Add Provider</span>
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
            placeholder="Search provider by name, brand or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="admin-select-filter"
          >
            <option value="all">All Providers ({providers.length})</option>
            <option value="active">Active in Quick Select ({providers.filter(p => p.isActive).length})</option>
            <option value="inactive">Inactive ({providers.filter(p => !p.isActive).length})</option>
          </select>
        </div>
      </div>

      {/* Providers Table */}
      <div className="admin-table-container admin-table-wrapper admin-table-scroll">
        <table className="admin-table" style={{ minWidth: '780px' }}>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Order</th>
              <th style={{ width: '80px' }}>Logo</th>
              <th>Provider Name & Slug</th>
              <th>Primary Category</th>
              <th>Brand Color</th>
              <th>Quick Select Status</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProviders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-muted)' }}>
                  No providers found matching your search.
                </td>
              </tr>
            ) : (
              filteredProviders.map((p, idx) => (
                <tr key={p.id || p.slug}>
                  <td>
                    <span className="order-badge">#{p.displayOrder || idx + 1}</span>
                  </td>
                  <td>
                    <div 
                      style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '8px', 
                        background: p.brandColor || '#0b132b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: '4px'
                      }}
                    >
                      {p.logo ? (
                        <img 
                          src={getCleanImageUrl(p.logo, p.updatedAt)} 
                          alt={p.name} 
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        />
                      ) : (
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>
                          {p.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: 'var(--admin-text-main)', fontSize: '0.92rem' }}>{p.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>Slug: {p.slug}</span>
                      {p.description && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{p.description}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="placement-pill" style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8' }}>
                      {categories.find(c => c.slug === p.categorySlug)?.name || p.categorySlug || 'Movies & Series'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span 
                        style={{ 
                          width: '18px', 
                          height: '18px', 
                          borderRadius: '50%', 
                          backgroundColor: p.brandColor || '#0284c7',
                          border: '1.5px solid #fff',
                          boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                        }} 
                      />
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{p.brandColor || '#0284c7'}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p)}
                      className={`status-toggle-btn ${p.isActive ? 'active' : 'inactive'}`}
                    >
                      {p.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{p.isActive ? 'Active (Quick Select)' : 'Inactive (Hidden)'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p)}
                        className="btn-primary-action"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProvider(p.id, p.name)}
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

      {/* CREATE / EDIT PROVIDER MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '620px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingProvider ? `Edit Provider: ${editingProvider.name}` : 'Create New Provider (Quick Select)'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="admin-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProvider}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {uploadError && (
                  <div className="admin-alert-banner error">
                    <AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Provider Name * (e.g. Amazon Prime, Netflix)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Amazon Prime"
                      value={formName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Provider Slug * (e.g. amazon-prime)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. amazon-prime"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Associated Category</label>
                    <select
                      className="admin-form-select"
                      value={formCategorySlug}
                      onChange={(e) => setFormCategorySlug(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
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

                {/* Brand Color & Presets */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Brand Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="color"
                      value={formBrandColor}
                      onChange={(e) => setFormBrandColor(e.target.value)}
                      style={{ width: '40px', height: '36px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formBrandColor}
                      onChange={(e) => setFormBrandColor(e.target.value)}
                      style={{ maxWidth: '140px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {PRESET_BRAND_COLORS.map(c => (
                      <button
                        type="button"
                        key={c.hex}
                        onClick={() => setFormBrandColor(c.hex)}
                        style={{
                          background: c.hex,
                          color: '#fff',
                          border: formBrandColor.toLowerCase() === c.hex.toLowerCase() ? '2px solid #fff' : '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                        }}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo URL & Upload */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Provider Logo (PNG / SVG / URL)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="https://... or upload below"
                      value={formLogo}
                      onChange={(e) => setFormLogo(e.target.value)}
                    />
                    <label className="btn-primary-action" style={{ cursor: 'pointer', padding: '8px 14px', whiteSpace: 'nowrap' }}>
                      <Upload size={14} />
                      <span>{isUploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadLogo}
                        style={{ display: 'none' }}
                        disabled={isUploadingLogo}
                      />
                    </label>
                  </div>
                  {formLogo && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', background: formBrandColor || '#070d1e', padding: '8px 14px', borderRadius: '8px' }}>
                      <img src={getCleanImageUrl(formLogo)} alt="Preview" style={{ height: '32px', maxWidth: '100px', objectFit: 'contain' }} />
                      <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>Logo Preview on Brand Color</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Provider Description</label>
                  <textarea
                    className="admin-form-textarea"
                    rows={2}
                    placeholder="Short description for customer info..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                {/* Active in Quick Select */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Quick Select Visibility</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setFormIsActive(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: formIsActive ? '#0284c7' : '#0b132b',
                        color: '#fff',
                        border: '1px solid #1e293b',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={14} /> Active in Quick Select
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormIsActive(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: !formIsActive ? '#dc2626' : '#0b132b',
                        color: '#fff',
                        border: '1px solid #1e293b',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} /> Inactive / Hidden
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
                  <span>{editingProvider ? 'Save Changes' : 'Create Provider'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
