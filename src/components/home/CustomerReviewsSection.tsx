import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, ShieldCheck, CheckCircle2, MessageSquare, 
  Sparkles, ThumbsUp 
} from 'lucide-react';
import { CustomerReview } from '../../types';
import { ottApi } from '../../services/api';
import './CustomerReviewsSection.css';

export const CustomerReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      const data = await ottApi.getApprovedReviews();
      const homeReviews = data.filter(r => {
        if (r.displayLocations && r.displayLocations.length > 0) {
          return r.displayLocations.includes('home') || r.displayLocations.includes('all');
        }
        return !r.pageType || r.pageType === 'home' || r.pageType === 'all';
      });
      setReviews(homeReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();

    const handleUpdate = () => loadReviews();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadReviews]);

  if (!loading && reviews.length === 0) {
    return null;
  }

  return (
    <section className="section reviews-showcase-section" id="reviews">
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="section-eyebrow">
              <Sparkles size={14} className="eyebrow-icon" />
              <span>VERIFIED CUSTOMER TESTIMONIALS</span>
            </div>
            <h2 className="section-title">
              <Star size={24} className="section-title-icon" color="#f59e0b" fill="#f59e0b" />
              <span>Customer Reviews & Ratings</span>
            </h2>
            <p className="section-subtitle">
              Real feedback from thousands of customers who trust OTT Sellers for instant delivery & 4K streaming.
            </p>
          </div>

          {/* Rating Summary Pill */}
          <div className="reviews-summary-card">
            <div className="summary-score-row">
              <div className="stars-cluster">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span className="summary-rating-num">4.9 / 5.0</span>
            </div>
            <div className="summary-subtitle">
              <ShieldCheck size={13} color="#22c55e" />
              <span>Based on 50,000+ Delivered Orders</span>
            </div>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="reviews-grid">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="review-card-skeleton" />
            ))
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="review-card">
                {/* User & Rating Row */}
                <div className="review-card-top">
                  <div className="review-author-info">
                    <div className="author-avatar-badge">
                      {r.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="author-name-row">
                        <span className="author-name">{r.userName}</span>
                        <span className="verified-buyer-pill">
                          <CheckCircle2 size={11} /> Verified Buyer
                        </span>
                      </div>
                      <div className="author-product-tag">{r.productName}</div>
                    </div>
                  </div>

                  <div className="review-stars-box">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <p className="review-comment-text">
                  &ldquo;{r.comment}&rdquo;
                </p>

                {/* Date / Footer */}
                <div className="review-card-footer">
                  <span className="review-date-text">{r.date}</span>
                  <span className="review-delivery-note">
                    <ThumbsUp size={12} color="#38bdf8" /> Instant Delivery
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
