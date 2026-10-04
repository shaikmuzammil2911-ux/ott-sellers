import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, List, ChevronDown, ArrowRight, Layers, Film, Tv, Trophy, Smile, Crown } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';
import './PopularCategorySection.css';

interface PopularCategorySectionProps {
  products: Product[];
}

export const PopularCategorySection: React.FC<PopularCategorySectionProps> = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>(['200-500']);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 'all', label: 'All Categories', icon: Layers },
    { id: 'movies-series', label: 'Movies & Series', icon: Film },
    { id: 'live-tv', label: 'Live TV', icon: Tv },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'kids', label: 'Kids', icon: Smile },
    { id: 'premium-apps', label: 'Premium Apps', icon: Crown },
  ];

  const handlePriceRangeToggle = (range: string) => {
    setSelectedPriceRanges(prev =>
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== 'all' && product.categorySlug !== selectedCategory) {
        return false;
      }

      // Price filter
      if (selectedPriceRanges.length > 0) {
        const price = product.plans[0].price;
        const matchesAnyRange = selectedPriceRanges.some(range => {
          if (range === 'under-200') return price < 200;
          if (range === '200-500') return price >= 200 && price <= 500;
          if (range === '500-1000') return price > 500 && price <= 1000;
          if (range === 'above-1000') return price > 1000;
          return true;
        });
        if (!matchesAnyRange) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.plans[0].price - b.plans[0].price;
      if (sortBy === 'price-high') return b.plans[0].price - a.plans[0].price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount; // Popularity default
    });
  }, [products, selectedCategory, selectedPriceRanges, sortBy]);

  return (
    <section className="section popular-category-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">
            <span className="netflix-red-circle">🔴</span>
            <span>Popular in OTT Sellers</span>
          </h2>
          <Link to="/category/movies-series" className="view-all-link">
            <span>View All Streamers</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="popular-layout-grid">
          {/* Left Filter Sidebar */}
          <aside className="popular-sidebar">
            <div className="sidebar-filter-box">
              <h3 className="sidebar-filter-title">Categories</h3>
              <ul className="sidebar-category-list">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        className={`sidebar-cat-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <Icon size={16} className="sidebar-cat-icon" />
                        <span>{cat.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="sidebar-divider"></div>

              <h3 className="sidebar-filter-title">Price Range</h3>
              <div className="sidebar-checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes('under-200')}
                    onChange={() => handlePriceRangeToggle('under-200')}
                  />
                  <span>Under ₹200</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes('200-500')}
                    onChange={() => handlePriceRangeToggle('200-500')}
                  />
                  <span>₹200 - ₹500</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes('500-1000')}
                    onChange={() => handlePriceRangeToggle('500-1000')}
                  />
                  <span>₹500 - ₹1000</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes('above-1000')}
                    onChange={() => handlePriceRangeToggle('above-1000')}
                  />
                  <span>Above ₹1000</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div className="popular-main-content">
            {/* Top Bar Controls */}
            <div className="popular-controls-bar">
              <div className="controls-left-count">
                Showing <strong>{filteredProducts.length}</strong> Subscriptions
              </div>

              <div className="controls-right-actions">
                <div className="sort-dropdown-container">
                  <label htmlFor="sortSelect" className="sort-label">Sort by:</label>
                  <div className="select-wrapper">
                    <select
                      id="sortSelect"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="custom-sort-select"
                    >
                      <option value="popularity">Popularity</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                    <ChevronDown size={14} className="select-chevron" />
                  </div>
                </div>

                <div className="view-mode-toggle">
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={17} />
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <List size={17} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid or List */}
            {filteredProducts.length === 0 ? (
              <div className="empty-category-filter">
                <p>No subscriptions match the selected category & price filters.</p>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedPriceRanges([]);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`popular-products-display ${viewMode === 'list' ? 'list-view-mode' : 'product-grid'}`}>
                {filteredProducts.slice(0, 8).map(prod => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
