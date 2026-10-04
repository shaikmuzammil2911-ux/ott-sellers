import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User as UserIcon, Menu, X, ChevronDown, Flame, Film, Tv, Trophy, Smile, Crown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { totalItemsCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on page route changes
  useEffect(() => {
    setIsMobileDrawerOpen(false);
    setIsCategoryMenuOpen(false);
  }, [location.pathname]);

  // Handle outside click for categories dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileDrawerOpen(false);
    }
  };

  const categoriesList = [
    { name: 'Movies & Series', slug: 'movies-series', icon: Film, color: '#e50914' },
    { name: 'Live TV', slug: 'live-tv', icon: Tv, color: '#10b981' },
    { name: 'Sports', slug: 'sports', icon: Trophy, color: '#0284c7' },
    { name: 'Kids', slug: 'kids', icon: Smile, color: '#f59e0b' },
    { name: 'Premium Apps', slug: 'premium-apps', icon: Crown, color: '#8b5cf6' },
  ];

  return (
    <header className={`site-header ${isSticky ? 'is-sticky' : ''}`}>
      {/* Desktop & Main Header Row */}
      <div className="container header-container">
        {/* Brand Logo */}
        <Link to="/" className="header-logo" aria-label="OTT Sellers Home">
          <img 
            src="/logo.png" 
            alt="OTT Sellers" 
            className="brand-logo-img"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>

          {/* Categories Dropdown */}
          <div className="nav-dropdown-wrapper" ref={categoryMenuRef}>
            <button 
              type="button"
              className={`nav-link dropdown-btn ${location.pathname.startsWith('/category') ? 'active' : ''}`}
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              aria-expanded={isCategoryMenuOpen}
            >
              <span>Categories</span>
              <ChevronDown size={15} className={`dropdown-chevron ${isCategoryMenuOpen ? 'open' : ''}`} />
            </button>

            {isCategoryMenuOpen && (
              <div className="categories-dropdown-menu">
                <div className="dropdown-header-note">Browse by Category</div>
                {categoriesList.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      className="dropdown-item"
                      onClick={() => setIsCategoryMenuOpen(false)}
                    >
                      <span className="dropdown-item-icon" style={{ color: cat.color }}>
                        <Icon size={18} />
                      </span>
                      <span className="dropdown-item-name">{cat.name}</span>
                    </Link>
                  );
                })}
                <div className="dropdown-divider"></div>
                <Link to="/catalogs" className="dropdown-footer-link" onClick={() => setIsCategoryMenuOpen(false)}>
                  View All Catalogs & Bundles →
                </Link>
              </div>
            )}
          </div>

          <Link to="/catalogs" className={`nav-link ${location.pathname.startsWith('/catalog') ? 'active' : ''}`}>
            Catalogs
          </Link>

          <Link to="/search?q=trending" className="nav-link trending-link">
            <Flame size={16} className="trending-icon" />
            <span>Trending</span>
          </Link>
        </nav>

        {/* Desktop Search Bar */}
        <form className="desktop-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="desktop-search-input"
            placeholder="Search for OTT, Movies, Subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="desktop-search-btn" aria-label="Search">
            <Search size={17} />
          </button>
        </form>

        {/* Right Action Icons: Login & Cart */}
        <div className="header-actions">
          {isAuthenticated ? (
            <Link to="/account" className="auth-pill-btn user-logged-in" title="My Account">
              <UserIcon size={18} />
              <span className="auth-btn-text">{user?.name ? user.name.split(' ')[0] : 'Account'}</span>
            </Link>
          ) : (
            <Link to="/login" className="auth-pill-btn">
              <UserIcon size={18} />
              <span className="auth-btn-text">Login / Register</span>
            </Link>
          )}

          <Link to="/cart" className="cart-header-btn" aria-label="View Shopping Cart">
            <ShoppingCart size={22} />
            {totalItemsCount > 0 && (
              <span className="cart-badge-count">{totalItemsCount}</span>
            )}
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle-btn"
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileDrawerOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Second Row: Search Bar */}
      <div className="mobile-search-row">
        <div className="container">
          <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
            <Search size={18} className="mobile-search-icon" />
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Search OTT, Netflix, Prime, Hotstar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="clear-search-btn" 
                onClick={() => setSearchQuery('')}
              >
                <X size={15} />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileDrawerOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <img src="/logo.png" alt="OTT Sellers" className="drawer-logo" />
              <button 
                className="close-drawer-btn" 
                onClick={() => setIsMobileDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              <div className="drawer-section-title">Navigation</div>
              <Link to="/" className="drawer-link" onClick={() => setIsMobileDrawerOpen(false)}>
                Home
              </Link>
              <Link to="/catalogs" className="drawer-link" onClick={() => setIsMobileDrawerOpen(false)}>
                Catalogs & Bundles
              </Link>
              <Link to="/search?q=trending" className="drawer-link" onClick={() => setIsMobileDrawerOpen(false)}>
                🔥 Trending Subscriptions
              </Link>

              <div className="drawer-section-title">Categories</div>
              {categoriesList.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="drawer-link sub-link"
                  onClick={() => setIsMobileDrawerOpen(false)}
                >
                  <span style={{ color: cat.color }}>•</span>
                  <span>{cat.name}</span>
                </Link>
              ))}

              <div className="drawer-section-title">Account & Orders</div>
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="drawer-link" onClick={() => setIsMobileDrawerOpen(false)}>
                    My Profile
                  </Link>
                  <Link to="/account/orders" className="drawer-link" onClick={() => setIsMobileDrawerOpen(false)}>
                    My Orders
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="drawer-link" onClick={() => setIsMobileDrawerOpen(false)}>
                    Customer Login
                  </Link>
                  <Link to="/register" className="drawer-link" onClick={() => setIsMobileDrawerOpen(false)}>
                    Create New Account
                  </Link>
                </>
              )}
              <Link to="/cart" className="drawer-link" onClick={() => setIsMobileDrawerOpen(false)}>
                Shopping Cart ({totalItemsCount})
              </Link>
            </div>

            <div className="mobile-drawer-footer">
              <a 
                href="https://wa.me/919876543210?text=Hi%20OTT%20Sellers%2C%20I%20have%20an%20enquiry%20regarding%20subscriptions."
                target="_blank" 
                rel="noreferrer"
                className="drawer-whatsapp-btn"
              >
                WhatsApp Support: +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
