import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Layers, Flame, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './MobileBottomNav.css';

export const MobileBottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

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
        to="/category/movies-series" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Layers size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Categories</span>
      </NavLink>

      <NavLink 
        to="/offers" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Flame size={20} className="bottom-nav-icon" color="#e50914" />
        <span className="bottom-nav-label" style={{ fontWeight: 600 }}>Offers</span>
      </NavLink>

      <NavLink 
        to={isAuthenticated ? "/account" : "/login"} 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">{isAuthenticated ? 'Account' : 'Login'}</span>
      </NavLink>
    </nav>
  );
};


