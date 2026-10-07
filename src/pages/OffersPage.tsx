import React, { useState, useEffect, useCallback } from 'react';
import { Flame, SlidersHorizontal, ArrowRight, Zap } from 'lucide-react';
import { Product } from '../types';
import { ottApi, getCleanImageUrl } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { Link } from 'react-router-dom';
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
        {/* Header Title */}
        <div className="items-header-row" style={{ marginBottom: '14px' }}>
          <div>
            <h1 className="items-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.35rem' }}>
              <Flame size={24} color="#e50914" fill="#e50914" />
              <span>Special Promotional Offers & Binge Deals</span>
            </h1>
            <p className="items-page-subtitle" style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Exclusive discounted subscriptions • Instant WhatsApp credentials delivery • 100% Genuine Profiles
            </p>
          </div>
        </div>

        {/* Product Cards Grid: Consistent Compact 5-column / 2-column Grid */}
        {loading ? (
          <div className="product-grid five-cols">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="product-skeleton-card"></div>
            ))}
          </div>
        ) : offerProducts.length === 0 ? (
          <div className="items-empty-state">
            <Flame size={40} color="#94a3b8" />
            <h3>No Active Offers Today</h3>
            <p>Check back shortly or browse all available subscriptions in our catalog.</p>
            <Link to="/items" className="btn-reset-filters">
              Browse All Subscriptions
            </Link>
          </div>
        ) : (
          <div className="product-grid five-cols">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
