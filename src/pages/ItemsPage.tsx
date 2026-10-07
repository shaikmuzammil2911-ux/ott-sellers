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
  SlidersHorizontal 
} from 'lucide-react';
import { Product, Category, SubCategory } from '../types';
import { ottApi } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
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

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return (a.plans[0]?.price || a.price || 0) - (b.plans[0]?.price || b.price || 0);
        }
        if (sortBy === 'price-high') {
          return (b.plans[0]?.price || b.price || 0) - (a.plans[0]?.price || a.price || 0);
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return b.reviewsCount - a.reviewsCount; // Default: Popularity
      });
  }, [products, selectedCategory, selectedSubcategory, sortBy]);

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Film': return <Film size={15} />;
      case 'Tv': return <Tv size={15} />;
      case 'Trophy': return <Trophy size={15} />;
      case 'Smile': return <Smile size={15} />;
      case 'Crown': return <Crown size={15} />;
      default: return <Film size={15} />;
    }
  };

  return (
    <div className="items-page">
      <div className="container">
        {/* 1. Category Filter Bar (Compact Horizontal Scrolling Bar) */}
        <div className="items-categories-filter-bar">
          <div className="categories-scroll-wrapper">
            <button
              type="button"
              className={`cat-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('all')}
            >
              <Layers size={15} />
              <span>All Plans</span>
              <span className="badge-count">{products.length}</span>
            </button>

            {categories.map((cat) => {
              const count = products.filter(p => p.categorySlug === cat.slug).length;
              return (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  className={`cat-filter-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.slug)}
                >
                  {getCategoryIcon(cat.iconName)}
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
            <span className="sub-filter-label">Provider:</span>
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
                  key={sub.id || sub.slug}
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

        {/* 3. Results Header & Sorting Bar */}
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

        {/* 4. Product Cards Grid: Square 1:1 image focus */}
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
            <p>Try resetting the category filter or choosing another option.</p>
            <button 
              type="button" 
              className="btn-reset-filters" 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
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
