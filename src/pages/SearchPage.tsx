import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Tag, AlertCircle } from 'lucide-react';
import { ottApi } from '../services/api';
import { Product } from '../types';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import './SearchPage.css';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const quickSearches = [
    'Netflix',
    'Prime Video',
    'Disney+ Hotstar',
    'YouTube Premium',
    'SonyLIV',
    'ZEE5',
    'Combo Bundle',
    'Sports'
  ];

  useEffect(() => {
    setInputVal(query);
    const performSearch = async () => {
      setLoading(true);
      if (!query.trim()) {
        const allProds = await ottApi.getProducts();
        setResults(allProds);
      } else {
        const matched = await ottApi.searchProducts(query);
        setResults(matched);
      }
      setLoading(false);
    };

    performSearch();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleQuickTagClick = (tag: string) => {
    setInputVal(tag);
    setSearchParams({ q: tag });
  };

  return (
    <div className="search-page">
      <div className="container">
        <Breadcrumb items={[{ label: 'Search' }]} />

        {/* Search Header Form */}
        <div className="search-header-box">
          <h1 className="search-page-title">Find Your Next Subscription</h1>
          <form className="search-bar-expanded" onSubmit={handleSearchSubmit}>
            <SearchIcon size={22} className="expanded-search-icon" />
            <input
              type="text"
              className="expanded-search-input"
              placeholder="Search Netflix, Hotstar, Prime, 4K UHD, Sports..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-search-submit">
              Search
            </button>
          </form>

          {/* Quick Search Tag Pills */}
          <div className="quick-tags-row">
            <span className="quick-tags-label">Popular Searches:</span>
            {quickSearches.map(tag => (
              <button
                key={tag}
                type="button"
                className={`quick-tag-chip ${query.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
                onClick={() => handleQuickTagClick(tag)}
              >
                <Tag size={12} />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter / Title */}
        <div className="search-results-summary">
          {query ? (
            <p>
              Found <strong>{results.length}</strong> {results.length === 1 ? 'subscription' : 'subscriptions'} for "{query}"
            </p>
          ) : (
            <p>Showing all available subscriptions ({results.length})</p>
          )}
        </div>

        {/* Results Grid or Empty State */}
        {loading ? (
          <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
            <p>Searching subscriptions...</p>
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No Subscriptions Found"
            description={`We couldn't find any plans matching "${query}". Try searching with brand names like Netflix, Prime, Hotstar, or live sports.`}
            actionText="Browse Categories"
            actionTo="/catalogs"
          />
        ) : (
          <div className="product-grid">
            {results.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
