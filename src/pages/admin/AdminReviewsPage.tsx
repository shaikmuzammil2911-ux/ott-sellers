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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-400" />
            Customer Reviews & Ratings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Moderate testimonials, approve authentic ratings, and maintain live trust badges.
          </p>
        </div>

        <button
          onClick={() => saveReviews(INITIAL_REVIEWS)}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors self-start sm:self-auto"
          title="Reset reviews to defaults"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {(['all', 'approved', 'pending', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                statusFilter === tab 
                  ? 'bg-primary-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No reviews match the selected filter.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base">{r.userName}</h3>
                    <div className="text-xs text-primary-400 font-medium">{r.productName}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {r.rating}.0
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  &ldquo;{r.comment}&rdquo;
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{r.date}</span>
                  <span className={`px-2 py-0.5 rounded font-semibold uppercase ${
                    r.status === 'approved' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : r.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {r.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                {r.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'approved')}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'rejected')}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                <button
                  onClick={() => handleDeleteReview(r.id)}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
