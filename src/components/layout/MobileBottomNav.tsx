import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './MobileBottomNav.css';

export const MobileBottomNav: React.FC = () => {
  const { totalItemsCount } = useCart();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink 
        to="/" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Home</span>
      </NavLink>

      <NavLink 
        to="/catalogs" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Grid size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Categories</span>
      </NavLink>

      <NavLink 
        to="/search" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Search size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Search</span>
      </NavLink>

      <NavLink 
        to="/cart" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="bottom-nav-cart-wrapper">
          <ShoppingBag size={20} className="bottom-nav-icon" />
          {totalItemsCount > 0 && (
            <span className="bottom-nav-badge">{totalItemsCount}</span>
          )}
        </div>
        <span className="bottom-nav-label">Cart</span>
      </NavLink>

      <NavLink 
        to="/account" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Account</span>
      </NavLink>
    </nav>
  );
};
