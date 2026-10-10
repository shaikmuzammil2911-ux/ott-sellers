import React, { useState, useEffect } from 'react';
import { 
  Star, Search, Check, X, Trash2, Plus, Edit2, 
  ThumbsUp, MessageSquare, AlertCircle, RefreshCw, Filter, Sparkles 
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { CustomerReview, Category, Product } from '../../types';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(() => ottApi.getCachedReviewsAdmin());
  const [categories, setCategories] = useState<Category[]>(() => ottApi.getCachedCategoriesAdmin());
  const [products, setProducts] = useState<Product[]>(() => ottApi.getCachedProductsAdmin());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [formUserName, setFormUserName] = useState('');
  const [formUserEmail, setFormUserEmail] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formCategorySlug, setFormCategorySlug] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formStatus, setFormStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [formDisplayLocations, setFormDisplayLocations] = useState<string[]>(['home']);
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formDate, setFormDate] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revs, cats, prods] = await Promise.all([
        ottApi.getAllReviewsAdmin(),
        ottApi.getAllCategoriesAdmin(),
        ottApi.getAllProductsAdmin()
      ]);
      setReviews(revs);
      setCategories(cats);
      setProducts(prods);
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
    setEditingReview(null);
    setFormUserName('');
    setFormUserEmail('');
    setFormProductName(products[0]?.name || 'Netflix Premium 4K');
    setFormProductId(products[0]?.id || '');
    setFormCategorySlug(categories[0]?.slug || '');
    setFormRating(5);
    setFormComment('');
    setFormStatus('approved');
    setFormDisplayLocations(['home']);
    setFormDisplayOrder(String(reviews.length + 1));
    setFormDate(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r: CustomerReview) => {
    setEditingReview(r);
    setFormUserName(r.userName);
    setFormUserEmail(r.userEmail || '');
    setFormProductName(r.productName);
    setFormProductId(r.productId || '');
    setFormCategorySlug(r.categorySlug || '');
    setFormRating(r.rating);
    setFormComment(r.comment);
    setFormStatus(r.status);
    setFormDisplayLocations(r.displayLocations && r.displayLocations.length > 0 ? r.displayLocations : [r.pageType || 'home']);
    setFormDisplayOrder(String(r.displayOrder || 1));
    setFormDate(r.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleDisplayLocation = (loc: string) => {
    if (loc === 'all') {
      setFormDisplayLocations(['all']);
      return;
    }
    const filtered = formDisplayLocations.filter(l => l !== 'all');
    if (filtered.includes(loc)) {
      const next = filtered.filter(l => l !== loc);
      setFormDisplayLocations(next.length > 0 ? next : ['home']);
    } else {
      setFormDisplayLocations([...filtered, loc]);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formUserName.trim() || !formComment.trim()) {
      setFormError('Customer name and review comment are required.');
      return;
    }

    if (formDisplayLocations.length === 0) {
      setFormError('Please select at least one display location for "Show This Review On".');
      return;
    }

    const reviewData: CustomerReview = {
      id: editingReview?.id || 'rev-' + Date.now(),
      userName: formUserName.trim(),
      userEmail: formUserEmail.trim(),
      productName: formProductName.trim() || 'OTT Subscription',
      productId: formProductId || undefined,
      categorySlug: formCategorySlug || undefined,
      rating: Number(formRating) || 5,
      comment: formComment.trim(),
      status: formStatus,
      displayLocations: formDisplayLocations as any,
      pageType: formDisplayLocations[0] as any || 'home',
      displayOrder: Number(formDisplayOrder) || 1,
      date: formDate.trim() || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedAt: Date.now()
    };

    await ottApi.saveReview(reviewData);
    await ottApi.logAudit(editingReview ? 'UPDATE_REVIEW' : 'CREATE_REVIEW', 'reviews', reviewData.id, { 
      userName: reviewData.userName, 
      displayLocations: reviewData.displayLocations 
    });

    showToast(`Review by "${reviewData.userName}" saved to Supabase! Live store updated.`);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteReview = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the review by "${name}"?`)) {
      await ottApi.deleteReview(id);
      await ottApi.logAudit('DELETE_REVIEW', 'reviews', id, { name });
      showToast('Review deleted.');
      await loadData();
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const target = reviews.find(r => r.id === id);
    if (!target) return;
    const updated: CustomerReview = { ...target, status, updatedAt: Date.now() };
    await ottApi.saveReview(updated);
    showToast(`Review status updated to ${status}.`);
    await loadData();
  };

  const filteredReviews = reviews.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      r.userName.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (locationFilter !== 'all') {
      const locs = (r.displayLocations || [r.pageType || 'home']) as string[];
      if (!locs.includes(locationFilter) && !locs.includes('all')) return false;
    }
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Star className="admin-heading-icon" style={{ color: '#f59e0b' }} />
            <span>Customer Reviews & Testimonials</span>
          </h1>
          <p className="admin-sub-text">
            Add testimonials, moderate ratings, and assign reviews to display locations (Home, Items, Category, etc.).
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh database"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary-action"
          >
            <Plus size={16} />
            <span>Add Review</span>
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
            placeholder="Search reviews by customer, product, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Display Locations</option>
            <option value="home">Homepage Only</option>
            <option value="items">Items Page</option>
            <option value="categories">Category Pages</option>
            <option value="offers">Offers & Deals</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="admin-select-filter"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved (Live)</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {filteredReviews.map((r) => {
          const locs = r.displayLocations && r.displayLocations.length > 0 ? r.displayLocations : [r.pageType || 'home'];
          return (
            <div
              key={r.id}
              style={{
                background: '#070d1e',
                border: `1px solid ${r.status === 'approved' ? '#1e293b' : '#334155'}`,
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                opacity: r.status === 'approved' ? 1 : 0.65
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        fill={i < r.rating ? '#f59e0b' : 'transparent'}
                        color={i < r.rating ? '#f59e0b' : '#64748b'}
                      />
                    ))}
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f59e0b', marginLeft: '4px' }}>
                      {r.rating}.0
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: r.status === 'approved' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: r.status === 'approved' ? '#22c55e' : '#f87171'
                  }}>
                    {r.status.toUpperCase()}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  {r.userName}
                </h4>
                <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '3px 0 0' }}>
                  Product: <strong style={{ color: '#cbd5e1' }}>{r.productName}</strong> • {r.date}
                </p>

                {/* Locations Pills */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '8px 0 0' }}>
                  {locs.map(l => (
                    <span key={l} style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                      📍 {l}
                    </span>
                  ))}
                </div>

                <p style={{ fontSize: '0.8rem', color: '#e2e8f0', margin: '10px 0 0', lineHeight: 1.45 }}>
                  "{r.comment}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {r.status !== 'approved' ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(r.id, 'approved')}
                      style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(r.id, 'rejected')}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Reject
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(r)}
                    className="btn-primary-action"
                    style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(r.id, r.userName)}
                    className="btn-refresh-action"
                    style={{ color: 'var(--admin-danger)', padding: '4px 8px' }}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8', background: '#070d1e', borderRadius: '12px', border: '1px dashed #1e293b' }}>
          <Star size={32} style={{ opacity: 0.5, marginBottom: '6px' }} />
          <p>No reviews found matching the filters.</p>
        </div>
      )}

      {/* Add / Edit Review Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingReview ? 'Edit Review & Display Locations' : 'Create New Customer Review'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="admin-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReview}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formError && (
                  <div className="admin-alert-banner error">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Reviewer Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      value={formUserName}
                      onChange={(e) => setFormUserName(e.target.value)}
                      placeholder="e.g. Karthik S."
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Rating *</label>
                    <select
                      className="admin-form-select"
                      value={formRating}
                      onChange={(e) => setFormRating(Number(e.target.value))}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                      <option value={2}>⭐⭐ (2 Stars)</option>
                      <option value={1}>⭐ (1 Star)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Associated Product / Item</label>
                    <select
                      className="admin-form-select"
                      value={formProductId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setFormProductId(pid);
                        const p = products.find(prod => prod.id === pid);
                        if (p) setFormProductName(p.name);
                      }}
                    >
                      <option value="">Custom Item Name (Enter below)</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Item Display Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      value={formProductName}
                      onChange={(e) => setFormProductName(e.target.value)}
                      placeholder="e.g. Netflix Premium 4K (Private PIN)"
                    />
                  </div>
                </div>

                {/* Module 4.1: Show This Review On */}
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                  <label className="admin-form-label" style={{ color: '#38bdf8', fontWeight: 800, marginBottom: '8px' }}>
                    Show This Review On * (Select applicable display locations)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    {[
                      { key: 'home', label: 'Homepage' },
                      { key: 'items', label: 'Items Catalog' },
                      { key: 'categories', label: 'Category Pages' },
                      { key: 'offers', label: 'Special Deals' },
                      { key: 'all', label: 'All Pages' }
                    ].map(loc => {
                      const isSelected = formDisplayLocations.includes(loc.key);
                      return (
                        <button
                          type="button"
                          key={loc.key}
                          onClick={() => handleToggleDisplayLocation(loc.key)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isSelected ? 'rgba(56, 189, 248, 0.2)' : '#0b132b',
                            border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: isSelected ? '#ffffff' : '#94a3b8',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Check size={12} color={isSelected ? '#38bdf8' : 'transparent'} />
                          <span>{loc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Review Content / Testimonial *</label>
                  <textarea
                    rows={3}
                    className="admin-form-input"
                    required
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="e.g. Got my PIN within 60 seconds on WhatsApp! Streaming flawlessly in 4K."
                  />
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Publication Status</label>
                    <select
                      className="admin-form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                    >
                      <option value="approved">Approved (Live on Storefront)</option>
                      <option value="pending">Pending Moderation</option>
                      <option value="rejected">Rejected (Hidden)</option>
                    </select>
                  </div>
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
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-refresh-action">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action">
                  <Check size={16} />
                  <span>{editingReview ? 'Save Changes' : 'Save Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
