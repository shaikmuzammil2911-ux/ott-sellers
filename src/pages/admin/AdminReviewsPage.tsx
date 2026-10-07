import React, { useState, useEffect } from 'react';
import { 
  Star, Search, Check, X, Trash2, Filter, 
  ThumbsUp, MessageSquare, AlertCircle, RefreshCw 
} from 'lucide-react';
import { ottApi } from '../../services/api';

interface CustomerReview {
  id: string;
  userName: string;
  userEmail: string;
  productName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
}

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    userName: 'Karthik S.',
    userEmail: 'karthik@example.com',
    productName: 'Netflix Premium 4K (Private PIN)',
    rating: 5,
    comment: 'Got my 4-digit PIN within 60 seconds on WhatsApp! Streaming UHD HDR flawlessly on my LG OLED.',
    status: 'approved',
    date: '06 Oct 2026'
  },
  {
    id: 'rev-2',
    userName: 'Ananya Sharma',
    userEmail: 'ananya@example.com',
    productName: 'Prime Video 4K UHD',
    rating: 5,
    comment: 'Super fast delivery and prompt customer support on WhatsApp number 9441323332. Highly recommended!',
    status: 'approved',
    date: '05 Oct 2026'
  },
  {
    id: 'rev-3',
    userName: 'Vikram Joshi',
    userEmail: 'vikram@example.com',
    productName: 'Disney+ Hotstar Super Plan',
    rating: 4,
    comment: 'Working fine for cricket matches, high quality stream without buffering.',
    status: 'approved',
    date: '04 Oct 2026'
  },
  {
    id: 'rev-4',
    userName: 'Deepak V.',
    userEmail: 'deepak@example.com',
    productName: 'OTT Reseller Combo Pack',
    rating: 5,
    comment: 'Best rates in the market with full duration warranty. Worth every rupee.',
    status: 'pending',
    date: '07 Oct 2026'
  }
];

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ott_sellers_admin_reviews');
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        setReviews(INITIAL_REVIEWS);
      }
    } catch {
      setReviews(INITIAL_REVIEWS);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveReviews = (updated: CustomerReview[]) => {
    setReviews(updated);
    localStorage.setItem('ott_sellers_admin_reviews', JSON.stringify(updated));
  };

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    const updated = reviews.map(r => r.id === id ? { ...r, status } : r);
    saveReviews(updated);
    ottApi.logAudit('UPDATE_REVIEW_STATUS', 'reviews', id, { status });
  };

  const handleDeleteReview = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const updated = reviews.filter(r => r.id !== id);
      saveReviews(updated);
      ottApi.logAudit('DELETE_REVIEW', 'reviews', id);
    }
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
      {/* Responsive Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Star className="admin-heading-icon" style={{ color: '#f59e0b' }} />
            <span>Customer Reviews & Ratings</span>
          </h1>
          <p className="admin-sub-text">
            Moderate testimonials, approve authentic ratings, and maintain live trust badges.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={() => saveReviews(INITIAL_REVIEWS)}
            className="btn-refresh-action"
            title="Reset reviews to defaults"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Responsive Filter & Search Toolbar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search reviews by customer name, product or comment..."
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
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredReviews.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '48px 20px', textAlign: 'center', color: '#94a3b8', background: '#070d1e', borderRadius: '16px', border: '1px solid #1e293b' }}>
            No reviews match the selected filter criteria.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              style={{
                background: '#070d1e',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 2px 0' }}>{r.userName}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>{r.productName}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 8px', borderRadius: '8px', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 800 }}>
                    <Star size={13} fill="#f59e0b" />
                    <span>{r.rating}.0</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.5, background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', margin: 0 }}>
                  &ldquo;{r.comment}&rdquo;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b' }}>
                  <span>{r.date}</span>
                  <span className={`status-badge ${r.status === 'approved' ? 'active' : r.status === 'pending' ? 'pending' : 'inactive'}`}>
                    {r.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons with Generous Touch Size */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                {r.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'approved')}
                    style={{
                      padding: '8px 12px',
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
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'rejected')}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} /> Reject
                  </button>
                )}
                <button
                  onClick={() => handleDeleteReview(r.id)}
                  style={{
                    padding: '8px 10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    cursor: 'pointer'
                  }}
                  title="Delete Review"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
