import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ChevronDown, 
  Layers, 
  Film, 
  Tv, 
  Trophy, 
  Smile, 
  Crown,
  Zap,
  SlidersHorizontal,
  Sparkles,
  Search,
  X
} from 'lucide-react';
import { Product, Category, SubCategory, Provider, ItemsPageCMS } from '../types';
import { ottApi, DEFAULT_ITEMS_PAGE_CMS } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import './ItemsPage.css';

export const ItemsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const initialProvider = searchParams.get('provider') || searchParams.get('quick_select') || searchParams.get('quick_search') || 'all';
  const initialSub = searchParams.get('sub') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [cmsHeadings, setCmsHeadings] = useState<ItemsPageCMS>(DEFAULT_ITEMS_PAGE_CMS);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedProvider, setSelectedProvider] = useState<string>(initialProvider);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSub);
  const [sortBy, setSortBy] = useState<string>('popularity');

  // Load data & CMS Headings
  const loadData = useCallback(async () => {
    try {
      const [allProds, allCats, allSubs, allProvs, cms] = await Promise.all([
        ottApi.getProducts(),
        ottApi.getCategories(),
        ottApi.getSubcategories(),
        ottApi.getProviders(),
        ottApi.getItemsPageCMS()
      ]);
      setProducts(allProds);
      setCategories(allCats);
      setSubcategories(allSubs);
      setProviders(allProvs);
      if (cms) setCmsHeadings(cms);
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
    const prov = searchParams.get('provider') || searchParams.get('quick_select') || searchParams.get('quick_search');
    const sub = searchParams.get('sub');
    const q = searchParams.get('q');
    if (cat) setSelectedCategory(cat);
    if (prov) setSelectedProvider(prov);
    if (sub) setSelectedSubcategory(sub);
    if (q !== null && q !== undefined) setSearchQuery(q);
  }, [searchParams]);

  const handleProviderSelect = (slug: string) => {
    setSelectedProvider(slug);
    const params: Record<string, string> = {};
    if (slug !== 'all') params.quick_search = slug;
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (searchQuery) params.q = searchQuery;
    setSearchParams(params);
  };

  const handleCategorySelect = (slug: string) => {
    const targetSlug = selectedCategory === slug && slug !== 'all' ? 'all' : slug;
    setSelectedCategory(targetSlug);
    setSelectedSubcategory('all');
    const params: Record<string, string> = {};
    if (selectedProvider !== 'all') params.quick_search = selectedProvider;
    if (targetSlug !== 'all') params.category = targetSlug;
    if (searchQuery) params.q = searchQuery;
    setSearchParams(params);
  };

  // Categories filtered by Quick Search Provider
  const availableCategories = useMemo(() => {
    if (selectedProvider === 'all') return categories;
    return categories.filter(c => {
      if (c.providerSlug?.toLowerCase() === selectedProvider.toLowerCase()) return true;
      return products.some(p => 
        p.categorySlug?.toLowerCase() === c.slug.toLowerCase() && 
        (p.providerSlug?.toLowerCase() === selectedProvider.toLowerCase() || p.subcategorySlug?.toLowerCase() === selectedProvider.toLowerCase())
      );
    });
  }, [categories, products, selectedProvider]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Text Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchCat = p.categoryName?.toLowerCase().includes(q);
          const matchProv = p.providerName?.toLowerCase().includes(q) || p.providerSlug?.toLowerCase().includes(q);
          const matchTagline = p.tagline?.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchProv && !matchTagline) return false;
        }

        // Quick Search Provider filter
        if (selectedProvider !== 'all') {
          const provMatches = 
            p.providerSlug?.toLowerCase() === selectedProvider.toLowerCase() ||
            p.subcategorySlug?.toLowerCase() === selectedProvider.toLowerCase() ||
            p.providerId === selectedProvider;
          if (!provMatches) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          const catMatches = 
            p.categorySlug?.toLowerCase() === selectedCategory.toLowerCase() ||
            p.subcategorySlug?.toLowerCase() === selectedCategory.toLowerCase();
          if (!catMatches) return false;
        }

        // Subcategory filter
        if (selectedSubcategory !== 'all') {
          const subMatches = p.subcategorySlug?.toLowerCase() === selectedSubcategory.toLowerCase();
          if (!subMatches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return (a.plans?.[0]?.price || a.price || 0) - (b.plans?.[0]?.price || b.price || 0);
        }
        if (sortBy === 'price-high') {
          return (b.plans?.[0]?.price || b.price || 0) - (a.plans?.[0]?.price || a.price || 0);
        }
        if (sortBy === 'rating') {
          return (b.rating || 4.9) - (a.rating || 4.9);
        }
        return (b.reviewsCount || 100) - (a.reviewsCount || 100);
      });
  }, [products, searchQuery, selectedProvider, selectedCategory, selectedSubcategory, sortBy]);

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Film': return <Film size={18} />;
      case 'Tv': return <Tv size={18} />;
      case 'Trophy': return <Trophy size={18} />;
      case 'Smile': return <Smile size={18} />;
      case 'Crown': return <Crown size={18} />;
      default: return <Layers size={18} />;
    }
  };

  const selectedProviderObj = providers.find(pr => pr.slug.toLowerCase() === selectedProvider.toLowerCase());
  const selectedCategoryObj = categories.find(c => c.slug.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="items-page">
      <div className="container">
        {/* Page Header (Editable Headings via CMS) */}
        <div className="items-page-header-block">
          <div className="items-header-text">
            <h1 className="items-main-title">
              {cmsHeadings.mainHeading || DEFAULT_ITEMS_PAGE_CMS.mainHeading}
            </h1>
            <p className="items-main-subtitle">
              {cmsHeadings.mainSubtitle || DEFAULT_ITEMS_PAGE_CMS.mainSubtitle}
            </p>
          </div>

          {/* Search Box */}
          <div className="items-search-input-wrap">
            <Search size={17} className="search-input-icon" />
            <input
              type="text"
              placeholder="Search Netflix, Prime, Hotstar, Plans..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const params: Record<string, string> = {};
                if (selectedProvider !== 'all') params.quick_search = selectedProvider;
                if (selectedCategory !== 'all') params.category = selectedCategory;
                if (e.target.value) params.q = e.target.value;
                setSearchParams(params);
              }}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  const params: Record<string, string> = {};
                  if (selectedProvider !== 'all') params.quick_search = selectedProvider;
                  if (selectedCategory !== 'all') params.category = selectedCategory;
                  setSearchParams(params);
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* 1. Quick Search (Provider-Based Filtering) */}
        <div className="items-quick-search-section">
          <div className="quick-search-header-row">
            <div className="quick-search-badge-title">
              <Zap size={15} className="quick-search-icon" />
              <span>{cmsHeadings.quickSearchHeading || 'Quick Search'}</span>
            </div>
            {selectedProvider !== 'all' && (
              <button
                type="button"
                className="btn-clear-provider"
                onClick={() => handleProviderSelect('all')}
              >
                Show All Providers
              </button>
            )}
          </div>

          <div className="quick-search-providers-list">
            <button
              type="button"
              className={`provider-chip-btn ${selectedProvider === 'all' ? 'active' : ''}`}
              onClick={() => handleProviderSelect('all')}
            >
              <span>All Providers</span>
              <span className="chip-count">{products.length}</span>
            </button>
            {providers.map((prov) => {
              const isActive = selectedProvider.toLowerCase() === prov.slug.toLowerCase();
              const count = products.filter(p => 
                p.providerSlug?.toLowerCase() === prov.slug.toLowerCase() || 
                p.subcategorySlug?.toLowerCase() === prov.slug.toLowerCase()
              ).length;

              return (
                <button
                  key={prov.id || prov.slug}
                  type="button"
                  className={`provider-chip-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleProviderSelect(prov.slug)}
                  style={{
                    backgroundColor: isActive ? (prov.brandColor || '#0284c7') : undefined,
                    borderColor: isActive ? (prov.brandColor || '#0284c7') : undefined
                  }}
                >
                  {prov.logo && (
                    <img src={prov.logo} alt="" className="provider-chip-logo" />
                  )}
                  <span>{prov.name}</span>
                  <span className="chip-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Categories Side-by-Side Responsive Grid (No horizontal scrolling) */}
        <div className="items-categories-grid-section">
          <div className="categories-section-header">
            <div className="categories-header-left">
              <Layers size={17} color="#0284c7" />
              <h2 className="categories-section-title">
                {cmsHeadings.categoriesHeading || 'Explore Categories'}
              </h2>
            </div>
            {selectedCategory !== 'all' && (
              <button 
                type="button" 
                className="btn-clear-category"
                onClick={() => handleCategorySelect('all')}
              >
                Show All Categories
              </button>
            )}
          </div>

          <div className="categories-responsive-grid">
            {/* All Plans Card */}
            <button
              type="button"
              className={`category-grid-card ${selectedCategory === 'all' ? 'selected' : ''}`}
              onClick={() => handleCategorySelect('all')}
            >
              <div className="category-card-icon-wrap" style={{ background: '#0b132b', color: '#38bdf8' }}>
                <Layers size={20} />
              </div>
              <div className="category-card-content">
                <span className="category-card-name">All Plans</span>
                <span className="category-card-count">
                  {selectedProvider === 'all' 
                    ? products.length 
                    : products.filter(p => p.providerSlug?.toLowerCase() === selectedProvider.toLowerCase()).length} Plans
                </span>
              </div>
            </button>

            {/* Individual Category Cards */}
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
              const count = products.filter(p => {
                const matchCat = p.categorySlug?.toLowerCase() === cat.slug.toLowerCase();
                if (!matchCat) return false;
                if (selectedProvider !== 'all') {
                  return p.providerSlug?.toLowerCase() === selectedProvider.toLowerCase() ||
                         p.subcategorySlug?.toLowerCase() === selectedProvider.toLowerCase();
                }
                return true;
              }).length;

              return (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  className={`category-grid-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(cat.slug)}
                >
                  <div 
                    className="category-card-icon-wrap" 
                    style={{ 
                      background: cat.badgeColor ? `${cat.badgeColor}18` : 'rgba(2, 132, 199, 0.1)',
                      color: cat.badgeColor || '#0284c7' 
                    }}
                  >
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <div className="category-card-content">
                    <span className="category-card-name">{cat.name}</span>
                    <span className="category-card-count">{count} {count === 1 ? 'Subscription' : 'Subscriptions'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Results Header & Sorting Bar */}
        <div className="items-results-bar">
          <div className="results-info-group">
            <h3 className="items-listing-heading">
              {cmsHeadings.itemsListingHeading || 'All Available Plans'}
            </h3>
            <span className="results-count">
              Showing <strong>{filteredProducts.length}</strong> verified subscriptions
              {selectedProviderObj && ` for ${selectedProviderObj.name}`}
              {selectedCategoryObj && ` in ${selectedCategoryObj.name}`}
            </span>
          </div>

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

        {/* 4. Product Cards Grid */}
        {loading ? (
          <div className="product-grid five-cols">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(idx => (
              <div key={idx} className="product-skeleton-card"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="items-empty-state">
            <SlidersHorizontal size={40} color="#94a3b8" />
            <h3>No subscriptions match your filter</h3>
            <p>
              {selectedProvider !== 'all' 
                ? `No plans found for "${selectedProviderObj?.name || selectedProvider}".` 
                : 'Try clearing your search or selecting another category.'}
            </p>
            <button 
              type="button" 
              className="btn-reset-filters" 
              onClick={() => {
                setSelectedProvider('all');
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
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsPage;

