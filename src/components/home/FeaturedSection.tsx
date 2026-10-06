import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { ottApi } from '../../services/api';
import { ProductCard } from '../common/ProductCard';
import './FeaturedSection.css';

export const FeaturedSection: React.FC = () => {
  const [featuredItems, setFeaturedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeatured = useCallback(async () => {
    try {
      const data = await ottApi.getFeaturedProducts();
      setFeaturedItems(data.slice(0, 5));
    } catch (err) {
      console.error('Error loading featured items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatured();

    const handleUpdate = () => loadFeatured();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadFeatured]);

  if (!loading && featuredItems.length === 0) {
    return null; // Keep homepage clean if admin turns off all featured items
  }

  return (
    <section className="section featured-section" id="featured">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <Star size={22} className="featured-star-icon" fill="#f59e0b" color="#f59e0b" />
            <span>Featured Subscriptions</span>
          </h2>
          <Link to="/items" className="view-all-link">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="product-grid five-cols">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="product-skeleton-card"></div>
            ))}
          </div>
        ) : (
          <div className="product-grid five-cols">
            {featuredItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
