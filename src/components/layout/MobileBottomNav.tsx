import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Flame, ShoppingBag } from 'lucide-react';
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
        to="/items" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Grid size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Items</span>
      </NavLink>

      <NavLink 
        to="/offers" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Flame size={20} className="bottom-nav-icon" color="#e50914" />
        <span className="bottom-nav-label" style={{ fontWeight: 600 }}>Offers</span>
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
    </nav>
  );
};

