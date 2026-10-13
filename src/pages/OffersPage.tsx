import React, { useState, useEffect, useCallback } from 'react';
import { Flame, SlidersHorizontal, ArrowRight, Zap } from 'lucide-react';
import { Product, OffersPageCMS } from '../types';
import { ottApi, getCleanImageUrl, DEFAULT_OFFERS_PAGE_CMS } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { Link } from 'react-router-dom';
import './ItemsPage.css';

export const OffersPage: React.FC = () => {
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [cms, setCms] = useState<OffersPageCMS>(DEFAULT_OFFERS_PAGE_CMS);
  const [loading, setLoading] = useState(true);

  const loadOffers = useCallback(async () => {
    try {
      const [data, cmsData] = await Promise.all([
        ottApi.getOfferProducts(),
        ottApi.getOffersPageCMS()
      ]);
      setOfferProducts(data);
      if (cmsData) {
        setCms(cmsData);
      }
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

  const headingText = cms?.heading?.trim() || '';
  const subheadingText = (cms?.subheading || cms?.subtitle || '').trim();
  const showBanner = cms?.bannerActive !== false && !!cms?.bannerImageUrl?.trim();

  return (
    <div className="items-page">
      <div className="container">
        {/* Optional Top Promotional Banner */}
        {showBanner && (
          <div style={{ marginBottom: '18px', width: '100%', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {cms.bannerLink ? (
              <Link to={cms.bannerLink} style={{ display: 'block', width: '100%' }}>
                <img 
                  src={getCleanImageUrl(cms.bannerImageUrl!)} 
                  alt={headingText || "Special Offers"} 
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
                />
              </Link>
            ) : (
              <img 
                src={getCleanImageUrl(cms.bannerImageUrl!)} 
                alt={headingText || "Special Offers"} 
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
              />
            )}
          </div>
        )}

        {/* Header Title & Subtitle (only if at least one is provided) */}
        {(headingText || subheadingText) && (
          <div className="items-header-row" style={{ marginBottom: '16px' }}>
            <div>
              {headingText && (
                <h1 className="items-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.35rem', margin: '0 0 6px 0' }}>
                  <Flame size={24} color="#e50914" fill="#e50914" />
                  <span>{headingText}</span>
                </h1>
              )}
              {subheadingText && (
                <p className="items-page-subtitle" style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                  {subheadingText}
                </p>
              )}
            </div>
          </div>
        )}

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
