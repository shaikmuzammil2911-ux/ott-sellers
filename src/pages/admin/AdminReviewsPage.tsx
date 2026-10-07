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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [formUserName, setFormUserName] = useState('');
  const [formUserEmail, setFormUserEmail] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formStatus, setFormStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');
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

  const handleOpenAddModal = () => {
    setEditingReview(null);
    setFormUserName('');
    setFormUserEmail('');
    setFormProductName('Netflix Premium 4K');
    setFormRating(5);
    setFormComment('');
    setFormStatus('approved');
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
    setFormDate(r.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserName.trim() || !formComment.trim()) {
      alert('Customer Name and Review Comment are required');
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
      date: formDate.trim() || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedAt: Date.now()
    };

    // Optimistic state update
    setReviews(prev => {
      const idx = prev.findIndex(item => item.id === reviewData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = reviewData;
        return copy;
      }
      return [reviewData, ...prev];
    });

    await ottApi.saveReview(reviewData);
    await ottApi.logAudit(editingReview ? 'UPDATE_REVIEW' : 'CREATE_REVIEW', 'reviews', reviewData.id, { userName: reviewData.userName });

    setSaveSuccessMsg(`Review by "${reviewData.userName}" saved to Supabase! Live storefront updated.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteReview = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the review by "${name}"?`)) {
      setReviews(prev => prev.filter(r => r.id !== id));
      await ottApi.deleteReview(id);
      await ottApi.logAudit('DELETE_REVIEW', 'reviews', id, { name });
      await loadData();
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const target = reviews.find(r => r.id === id);
    if (!target) return;
    const updated = { ...target, status, updatedAt: Date.now() };
    setReviews(prev => prev.map(r => r.id === id ? updated : r));
    await ottApi.saveReview(updated);
    await ottApi.logAudit('UPDATE_REVIEW_STATUS', 'reviews', id, { status });
    await loadData();
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = 
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Star className="admin-heading-icon" style={{ color: '#f59e0b' }} />
            <span>Customer Reviews & Ratings</span>
          </h1>
          <p className="admin-sub-text">
            Manage customer ratings, edit reviews, upload new testimonials, and moderate live website feedback.
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
            <span>Upload New Review</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search reviews by customer name, product, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-tabs-row">
          {(['all', 'approved', 'pending', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`admin-tab-btn ${statusFilter === tab ? 'active' : ''}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {loading && reviews.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 10px', color: '#0284c7' }} />
            Loading customer reviews from Supabase...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: '#94a3b8', background: '#070d1e', borderRadius: '16px', border: '1px solid #1e293b' }}>
            No reviews match the selected filter criteria. Click &quot;Upload New Review&quot; above to create one.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              style={{
                background: '#070d1e',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 2px 0' }}>{r.userName}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>{r.productName}</div>
                    {r.userEmail && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.userEmail}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 8px', borderRadius: '8px', color: '#f59e0b', fontSize: '0.82rem', fontWeight: 800 }}>
                    <Star size={14} fill="#f59e0b" />
                    <span>{r.rating}.0</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.84rem', color: '#e2e8f0', fontStyle: 'italic', lineHeight: 1.55, background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', margin: 0 }}>
                  &ldquo;{r.comment}&rdquo;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b' }}>
                  <span>{r.date}</span>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      background: r.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : r.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: r.status === 'approved' ? '#34d399' : r.status === 'pending' ? '#fbbf24' : '#f87171',
                      border: r.status === 'approved' ? '1px solid rgba(16, 185, 129, 0.3)' : r.status === 'pending' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    {r.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
                {r.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'approved')}
                    style={{
                      padding: '7px 12px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                <button
                  onClick={() => handleOpenEditModal(r)}
                  style={{
                    padding: '7px 12px',
                    background: '#1e293b',
                    color: '#cbd5e1',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                  title="Edit Review"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteReview(r.id, r.userName)}
                  style={{
                    padding: '7px 10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    cursor: 'pointer'
                  }}
                  title="Delete Review"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Review Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} style={{ color: '#f59e0b' }} />
                <span>{editingReview ? 'Edit Customer Review' : 'Upload New Customer Review'}</span>
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

            <form onSubmit={handleSaveReview} className="admin-form-grid">
              <div className="admin-form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formUserName}
                  onChange={(e) => setFormUserName(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Customer Email (Optional)</label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={formUserEmail}
                  onChange={(e) => setFormUserEmail(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Subscribed Product / Service *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Premium 4K / OTT Combo"
                  value={formProductName}
                  onChange={(e) => setFormProductName(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Rating (1 to 5 Stars)</label>
                <select
                  value={formRating}
                  onChange={(e) => setFormRating(Number(e.target.value))}
                  style={{ fontWeight: 700, color: '#f59e0b' }}
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                  <option value="3">⭐⭐⭐ 3 Stars (Average)</option>
                  <option value="2">⭐⭐ 2 Stars (Below Average)</option>
                  <option value="1">⭐ 1 Star (Poor)</option>
                </select>
              </div>

              <div className="admin-form-group admin-form-full">
                <label>Review Testimonial Text *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="What did the customer say about service speed, pricing, and WhatsApp delivery?"
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Date Displayed</label>
                <input
                  type="text"
                  placeholder="07 Oct 2026"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Moderation Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                >
                  <option value="approved">Approved (Active on Live Store)</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected (Hidden)</option>
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
                  className="btn-primary-action"
                  style={{ padding: '10px 22px' }}
                >
                  <Check size={16} />
                  <span>Save Review to Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
