import React, { useState, useEffect, useCallback } from 'react';
import { Flame, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { ottApi, getCleanImageUrl } from '../services/api';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Link } from 'react-router-dom';
import '../components/home/SpecialOffersSection.css';
import './ItemsPage.css';

export const OffersPage: React.FC = () => {
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffers = useCallback(async () => {
    try {
      const data = await ottApi.getOfferProducts();
      setOfferProducts(data);
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadOffers();

    const handleUpdate = () => loadOffers();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadOffers]);

  return (
    <div className="items-page">
      <div className="container">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: '🔥 Special Offers' }]} />

        <div className="items-header-row">
          <div>
            <h1 className="items-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={28} color="#e50914" fill="#e50914" />
              <span>Special Promotional Offers & Binge Deals</span>
            </h1>
            <p className="items-page-subtitle">
              Exclusive discounted subscriptions • Instant WhatsApp delivery • 100% Genuine Profiles
            </p>
          </div>
        </div>

        {loading ? (
          <div className="special-offers-grid" style={{ marginTop: '20px' }}>
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="offer-skeleton-card"></div>
            ))}
          </div>
        ) : offerProducts.length === 0 ? (
          <div className="items-empty-state">
            <Flame size={48} color="#94a3b8" />
            <h3>No Active Offers Today</h3>
            <p>Check back shortly or browse all available subscriptions in our catalog.</p>
            <Link to="/items" className="btn-reset-filters">
              Browse All Subscriptions
            </Link>
          </div>
        ) : (
          <div className="special-offers-grid" style={{ marginTop: '20px' }}>
            {offerProducts.map((product) => {
              const defaultPlan = product.plans[0];
              const originalPrice = product.offerOriginalPrice || defaultPlan.originalPrice;
              const offerPrice = product.offerPrice || defaultPlan.price;
              const discountPct = product.offerDiscountPercentage || defaultPlan.discountPercentage;
              const imgUrl = getCleanImageUrl(product.image, product.updatedAt);

              return (
                <div key={product.id} className="premium-offer-card">
                  <div className="offer-card-media" style={{ backgroundColor: product.brandColor || '#070d1e' }}>
                    <img src={imgUrl} alt={product.name} loading="lazy" />
                    <div className="offer-badge-pill">
                      <Zap size={13} fill="#ffffff" color="#ffffff" />
                      <span>{discountPct}% OFF</span>
                    </div>
                  </div>

                  <div className="offer-card-content">
                    <span className="offer-card-category">{product.categoryName}</span>
                    <h3 className="offer-card-title">{product.name}</h3>
                    <p className="offer-card-plan">{defaultPlan.duration} Plan</p>

                    <div className="offer-pricing-row">
                      <span className="offer-deal-price">₹ {offerPrice}</span>
                      <span className="offer-original-price">₹ {originalPrice}</span>
                      <span className="offer-savings-tag">Save ₹ {originalPrice - offerPrice}</span>
                    </div>

                    <Link to={`/product/${product.slug}`} className="btn-get-offer">
                      <span>Get Offer</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
