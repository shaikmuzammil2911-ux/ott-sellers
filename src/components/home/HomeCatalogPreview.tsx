import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { Product, Category } from '../../types';
import { ottApi } from '../../services/api';
import { ProductCard } from '../common/ProductCard';
import './HomeCatalogPreview.css';

export const HomeCatalogPreview: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [allProds, allCats] = await Promise.all([
        ottApi.getProducts(),
        ottApi.getCategories()
      ]);
      setProducts(allProds);
      setCategories(allCats);
    } catch (err) {
      console.error('Error loading catalog preview:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadData]);

  const displayedProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.categorySlug === selectedCategory);
    }
    return list.slice(0, 5); // Keep homepage clean - 5 items max!
  }, [products, selectedCategory]);

  return (
    <section className="section home-catalog-section" id="items">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Layers size={22} className="section-title-icon" color="#0284c7" />
              <span>Explore Top Subscriptions</span>
            </h2>
            <p className="section-subtitle">
              Verified 4K streaming accounts with instant WhatsApp credentials
            </p>
          </div>

          <Link to="/items" className="view-all-link">
            <span>View Full Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="catalog-filter-pills" role="tablist">
          <button
            type="button"
            className={`catalog-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Subscriptions
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`catalog-pill-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="product-grid five-cols">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="product-skeleton-card"></div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="catalog-empty-preview">
            <p>No subscriptions found in this category.</p>
          </div>
        ) : (
          <div className="product-grid five-cols">
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Explore Full Catalog Banner CTA */}
        <div className="catalog-view-all-cta-box">
          <div className="cta-box-text">
            <h3>Looking for more platforms or custom multi-month plans?</h3>
            <p>Browse our entire catalog of 20+ streaming services, combos, and tools.</p>
          </div>
          <Link to="/items" className="btn-explore-full-catalog">
            <span>Browse Full Catalog ({products.length}+ Items)</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};
