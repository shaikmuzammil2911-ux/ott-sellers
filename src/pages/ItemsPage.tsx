import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  Check, 
  X, 
  Film, 
  Tv, 
  Trophy, 
  Smile, 
  Crown,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Product, Category, SubCategory } from '../types';
import { ottApi } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { Breadcrumb } from '../components/common/Breadcrumb';
import './ItemsPage.css';

export const ItemsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const initialSub = searchParams.get('sub') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSub);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity');

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [allProds, allCats, allSubs] = await Promise.all([
        ottApi.getProducts(),
        ottApi.getCategories(),
        ottApi.getSubcategories()
      ]);
      setProducts(allProds);
      setCategories(allCats);
      setSubcategories(allSubs);
    } catch (err) {
      console.error('Error loading items data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadData]);

  // Sync state if search params change
  useEffect(() => {
    const cat = searchParams.get('category');
    const sub = searchParams.get('sub');
    if (cat) setSelectedCategory(cat);
    if (sub) setSelectedSubcategory(sub);
  }, [searchParams]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedSubcategory('all');
    setSearchParams(slug === 'all' ? {} : { category: slug });
  };

  const handleSubcategorySelect = (slug: string) => {
    setSelectedSubcategory(slug);
    const params: Record<string, string> = {};
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (slug !== 'all') params.sub = slug;
    setSearchParams(params);
  };

  // Subcategories available for selected category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'all') {
      return subcategories;
    }
    return subcategories.filter(s => s.categorySlug === selectedCategory);
  }, [subcategories, selectedCategory]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category filter
        if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) {
          return false;
        }

        // Subcategory filter
        if (selectedSubcategory !== 'all' && p.subcategorySlug !== selectedSubcategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches = 
            p.name.toLowerCase().includes(q) ||
            p.subcategoryName.toLowerCase().includes(q) ||
            p.tagline.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return (a.plans[0]?.price || 0) - (b.plans[0]?.price || 0);
        }
        if (sortBy === 'price-high') {
          return (b.plans[0]?.price || 0) - (a.plans[0]?.price || 0);
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return b.reviewsCount - a.reviewsCount; // Default: Popularity
      });
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film': return <Film size={16} />;
      case 'Tv': return <Tv size={16} />;
      case 'Trophy': return <Trophy size={16} />;
      case 'Smile': return <Smile size={16} />;
      case 'Crown': return <Crown size={16} />;
      default: return <Film size={16} />;
    }
  };

  return (
    <div className="items-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Items & Subscriptions' }]} />

        {/* Header Title & Search Row */}
        <div className="items-header-row">
          <div>
            <h1 className="items-page-title">Browse All OTT Subscriptions</h1>
            <p className="items-page-subtitle">
              Instant private credentials • 4K UHD streaming • 100% genuine accounts
            </p>
          </div>

          {/* Quick Search */}
          <div className="items-inline-search">
            <Search size={17} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search OTT, movies, plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="clear-btn" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 1. Category Filter Bar (Desktop Tabs + Mobile Dropdown / Horizontal Scroll) */}
        <div className="items-categories-filter-bar">
          <div className="categories-scroll-wrapper">
            <button
              type="button"
              className={`cat-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('all')}
            >
              <Layers size={16} />
              <span>All Categories</span>
              <span className="badge-count">{products.length}</span>
            </button>

            {categories.map((cat) => {
              const count = products.filter(p => p.categorySlug === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`cat-filter-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.slug)}
                >
                  {getCategoryIcon(cat.iconName || 'Compass')}
                  <span>{cat.name}</span>
                  <span className="badge-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Subcategory Pills Filter Bar */}
        {availableSubcategories.length > 0 && (
          <div className="items-subcategories-bar">
            <span className="sub-filter-label">Filter by Provider:</span>
            <div className="sub-scroll-wrapper">
              <button
                type="button"
                className={`sub-pill-btn ${selectedSubcategory === 'all' ? 'active' : ''}`}
                onClick={() => handleSubcategorySelect('all')}
              >
                All
              </button>
              {availableSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className={`sub-pill-btn ${selectedSubcategory === sub.slug ? 'active' : ''}`}
                  onClick={() => handleSubcategorySelect(sub.slug)}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Bar: Count & Sorting */}
        <div className="items-results-bar">
          <span className="results-count">
            Showing <strong>{filteredProducts.length}</strong> subscriptions
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}`}
          </span>

          <div className="items-sort-dropdown">
            <label htmlFor="sort-select">Sort by:</label>
            <div className="select-wrapper">
              <select 
                id="sort-select"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popularity">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
          </div>
        </div>

        {/* Product Cards Grid: 5-column desktop, 2-column mobile */}
        {loading ? (
          <div className="product-grid five-cols">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(idx => (
              <div key={idx} className="product-skeleton-card"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="items-empty-state">
            <SlidersHorizontal size={44} color="#94a3b8" />
            <h3>No subscriptions match your filters</h3>
            <p>Try resetting the category filter or searching for a different keyword.</p>
            <button 
              type="button" 
              className="btn-reset-filters" 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
                setSearchQuery('');
                setSearchParams({});
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="product-grid five-cols">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
