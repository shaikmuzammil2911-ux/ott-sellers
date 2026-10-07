import React, { useState, useEffect } from 'react';
import { 
  Star, Search, Check, X, Trash2, Plus, Edit2, 
  ThumbsUp, MessageSquare, AlertCircle, RefreshCw, Filter, Sparkles 
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { CustomerReview } from '../../types';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(() => ottApi.getCachedReviewsAdmin());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [pageFilter, setPageFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [formUserName, setFormUserName] = useState('');
  const [formUserEmail, setFormUserEmail] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formStatus, setFormStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [formPageType, setFormPageType] = useState<CustomerReview['pageType']>('home');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formDate, setFormDate] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ottApi.getAllReviewsAdmin();
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingReview(null);
    setFormUserName('');
    setFormUserEmail('');
    setFormProductName('Netflix Premium 4K');
    setFormRating(5);
    setFormComment('');
    setFormStatus('approved');
    setFormPageType('home');
    setFormDisplayOrder(String(reviews.length + 1));
    setFormDate(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r: CustomerReview) => {
    setEditingReview(r);
    setFormUserName(r.userName);
    setFormUserEmail(r.userEmail || '');
    setFormProductName(r.productName);
    setFormRating(r.rating);
    setFormComment(r.comment);
    setFormStatus(r.status);
    setFormPageType(r.pageType || 'home');
    setFormDisplayOrder(String(r.displayOrder || 1));
    setFormDate(r.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserName.trim() || !formComment.trim()) {
      alert('Customer name and review comment are required.');
      return;
    }

    const reviewData: CustomerReview = {
      id: editingReview?.id || 'rev-' + Date.now(),
      userName: formUserName.trim(),
      userEmail: formUserEmail.trim(),
      productName: formProductName.trim() || 'OTT Subscription',
      rating: Number(formRating) || 5,
      comment: formComment.trim(),
      status: formStatus,
      pageType: formPageType,
      displayOrder: Number(formDisplayOrder) || 1,
      date: formDate.trim() || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedAt: Date.now()
    };

    await ottApi.saveReview(reviewData);
    await ottApi.logAudit(editingReview ? 'UPDATE_REVIEW' : 'CREATE_REVIEW', 'reviews', reviewData.id, { 
      userName: reviewData.userName, 
      pageType: reviewData.pageType 
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
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (pageFilter !== 'all' && r.pageType !== pageFilter && r.pageType !== 'all') return false;
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Star className="admin-heading-icon" style={{ color: '#f59e0b' }} />
            <span>Customer Reviews & Page Mapping</span>
          </h1>
          <p className="admin-sub-text">
            Add testimonials, moderate ratings, and assign reviews to specific pages (Home, Items, Courses, etc.).
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
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Display Pages</option>
            <option value="home">Home Page</option>
            <option value="courses">Courses</option>
            <option value="items">Items</option>
            <option value="offers">Offers</option>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
        {filteredReviews.map((r) => (
          <div
            key={r.id}
            style={{
              background: '#070d1e',
              border: `1px solid ${r.status === 'approved' ? '#1e293b' : '#334155'}`,
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px',
              opacity: r.status === 'approved' ? 1 : 0.6
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

                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: r.status === 'approved' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: r.status === 'approved' ? '#22c55e' : '#f87171'
                  }}>
                    {r.status.toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(2, 132, 199, 0.15)',
                    color: '#38bdf8'
                  }}>
                    Page: {(r.pageType || 'home').toUpperCase()}
                  </span>
                </div>
              </div>

              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                {r.userName}
              </h4>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '2px 0 0' }}>
                Product: <strong style={{ color: '#cbd5e1' }}>{r.productName}</strong> • {r.date}
              </p>

              <p style={{ fontSize: '0.78rem', color: '#e2e8f0', margin: '8px 0 0', lineHeight: 1.4 }}>
                "{r.comment}"
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {r.status !== 'approved' ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(r.id, 'approved')}
                    style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(r.id, 'rejected')}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(r)}
                  style={{ background: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(2, 132, 199, 0.3)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteReview(r.id, r.userName)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer' }}
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
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
          <div className="admin-modal-box compact" style={{ maxWidth: '460px' }}>
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingReview ? 'Edit Review & Page Mapping' : 'Add New Customer Review'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group-compact">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formUserName}
                    onChange={(e) => setFormUserName(e.target.value)}
                    placeholder="e.g. Karthik S."
                  />
                </div>
                <div className="form-group-compact">
                  <label>Rating (1 - 5 Stars)</label>
                  <select
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

              <div className="form-group-compact">
                <label>Product / Subscription Name *</label>
                <input
                  type="text"
                  required
                  value={formProductName}
                  onChange={(e) => setFormProductName(e.target.value)}
                  placeholder="e.g. Netflix Premium 4K (Private PIN)"
                />
              </div>

              {/* Show this review on: Page selector */}
              <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px' }}>
                <div className="form-group-compact">
                  <label style={{ color: '#38bdf8' }}>Show this review on: *</label>
                  <select
                    value={formPageType}
                    onChange={(e) => setFormPageType(e.target.value as any)}
                  >
                    <option value="home">Home Page Testimonials</option>
                    <option value="items">Items & Subscriptions Page</option>
                    <option value="courses">Courses & Masterclasses</option>
                    <option value="offers">Special Offers Page</option>
                    <option value="all">All Applicable Pages</option>
                  </select>
                </div>
              </div>

              <div className="form-group-compact">
                <label>Review Comment *</label>
                <textarea
                  rows={3}
                  required
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="e.g. Got my PIN within 60 seconds on WhatsApp! Streaming flawlessly."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group-compact">
                  <label>Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                  >
                    <option value="approved">Approved (Live)</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="form-group-compact">
                  <label>Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
