import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal, Sparkles, AlertCircle } from 'lucide-react';
import { ottApi } from '../services/api';
import { Product, Category, SubCategory } from '../types';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ProductCard } from '../components/common/ProductCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import './CategoryPage.css';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<SubCategory | null>(null);
  const [allSubcategories, setAllSubcategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadCategoryData = async () => {
      if (!slug) return;
      setLoading(true);

      // Check if slug matches a main category
      const cat = await ottApi.getCategoryBySlug(slug);
      const sub = await ottApi.getSubcategoryBySlug(slug);
      const allSubs = await ottApi.getSubcategories();
      setAllSubcategories(allSubs);

      if (cat) {
        setCategory(cat);
        setSubcategory(null);
        setSelectedSubcategory('all');
        const prods = await ottApi.getProductsByCategory(cat.slug);
        setProducts(prods);
      } else if (sub) {
        setSubcategory(sub);
        // Find parent category
        const parentCat = await ottApi.getCategoryBySlug(sub.categorySlug);
        setCategory(parentCat || null);
        setSelectedSubcategory(sub.slug);
        const prods = await ottApi.getProductsBySubcategory(sub.slug);
        setProducts(prods);
      } else {
        // Fallback: search or all products
        const prods = await ottApi.getProducts();
        setProducts(prods);
      }

      setLoading(false);
    };

    loadCategoryData();
  }, [slug]);

  const relevantSubcategories = useMemo(() => {
    if (!category) return allSubcategories;
    return allSubcategories.filter(s => s.categorySlug === category.slug);
  }, [category, allSubcategories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Subcategory filter
      if (selectedSubcategory !== 'all' && p.subcategorySlug !== selectedSubcategory) {
        return false;
      }

      // Price filter
      if (selectedPriceRange !== 'all') {
        const price = p.plans[0].price;
        if (selectedPriceRange === 'under-250' && price >= 250) return false;
        if (selectedPriceRange === '250-500' && (price < 250 || price > 500)) return false;
        if (selectedPriceRange === '500-1000' && (price < 500 || price > 1000)) return false;
        if (selectedPriceRange === 'above-1000' && price <= 1000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.plans[0].price - b.plans[0].price;
      if (sortBy === 'price-high') return b.plans[0].price - a.plans[0].price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount;
    });
  }, [products, selectedSubcategory, selectedPriceRange, sortBy]);

  const pageTitle = subcategory 
    ? `${subcategory.name} Subscriptions` 
    : (category?.name || 'All OTT Subscriptions');

  const pageDesc = subcategory 
    ? `Explore genuine and discounted ${subcategory.name} plans with instant WhatsApp delivery & full warranty.` 
    : (category?.shortDescription || 'Discover premium streaming subscriptions with instant activation.');

  return (
    <div className="category-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Categories', to: '/catalogs' },
            ...(category ? [{ label: category.name, to: `/category/${category.slug}` }] : []),
            ...(subcategory ? [{ label: subcategory.name }] : [])
          ]}
        />

        {/* Category Hero / Banner */}
        <div 
          className="category-hero-banner" 
          style={{ 
            backgroundImage: category?.image ? `url(${category.image})` : undefined,
            backgroundColor: subcategory?.brandColor || '#0b132b'
          }}
        >
          <div className="category-hero-overlay">
            <div className="category-badge-chip">
              <Sparkles size={14} />
              <span>Verified OTT Platform</span>
            </div>
            <h1 className="category-page-title">{pageTitle}</h1>
            <p className="category-page-desc">{pageDesc}</p>
          </div>
        </div>

        {/* Subcategories Horizontal Filter Bar */}
        {relevantSubcategories.length > 0 && (
          <div className="category-subnav-bar">
            <button
              type="button"
              className={`subnav-pill ${selectedSubcategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSubcategory('all')}
            >
              All {category?.name || 'Brands'}
            </button>
            {relevantSubcategories.map(sub => (
              <button
                key={sub.id}
                type="button"
                className={`subnav-pill ${selectedSubcategory === sub.slug ? 'active' : ''}`}
                onClick={() => setSelectedSubcategory(sub.slug)}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Controls: Active filters & sorting */}
        <div className="category-toolbar">
          <div className="category-count-summary">
            Showing <strong>{filteredProducts.length}</strong> Subscriptions
          </div>

          <div className="category-filters-row">
            {/* Price Filter */}
            <div className="filter-select-box">
              <label htmlFor="priceFilter">Price:</label>
              <select
                id="priceFilter"
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="toolbar-select"
              >
                <option value="all">All Prices</option>
                <option value="under-250">Under ₹250</option>
                <option value="250-500">₹250 - ₹500</option>
                <option value="500-1000">₹500 - ₹1000</option>
                <option value="above-1000">Above ₹1000</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="filter-select-box">
              <label htmlFor="sortFilter">Sort:</label>
              <select
                id="sortFilter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="toolbar-select"
              >
                <option value="popularity">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid or Skeleton */}
        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map(n => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No Subscriptions Found"
            description="We couldn't find any plans matching your selected subcategory or price filter."
            actionText="Reset Filters"
            actionTo={`/category/${slug || 'movies-series'}`}
          />
        ) : (
          <div className="product-grid">
            {filteredProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
