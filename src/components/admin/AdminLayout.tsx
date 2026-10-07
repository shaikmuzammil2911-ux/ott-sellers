import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, GraduationCap, FolderTree, Image, 
  Sparkles, ShoppingCart, Users, Star, Settings, LogOut, 
  ExternalLink, Menu, X, ShieldCheck, Database, Bell 
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminLayout.css';
import './AdminMobile.css';

export const AdminLayout: React.FC = () => {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinks = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Catalog & Inventory',
      items: [
        { label: 'Products', to: '/admin/products', icon: Package },
        { label: 'Courses & Masterclasses', to: '/admin/courses', icon: GraduationCap },
        { label: 'Categories', to: '/admin/categories', icon: FolderTree }
      ]
    },
    {
      group: 'Website Content (CMS)',
      items: [
        { label: 'Hero Section CMS', to: '/admin/hero', icon: Sparkles },
        { label: 'Promotional Banners', to: '/admin/banners', icon: Image }
      ]
    },
    {
      group: 'Sales & Customers',
      items: [
        { label: 'Orders & Payments', to: '/admin/orders', icon: ShoppingCart },
        { label: 'Customers', to: '/admin/customers', icon: Users },
        { label: 'Customer Reviews', to: '/admin/reviews', icon: Star }
      ]
    },
    {
      group: 'System',
      items: [
        { label: 'Store Settings', to: '/admin/settings', icon: Settings }
      ]
    }
  ];

  return (
    <div className="admin-wrapper">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-brand-logo">
            <span className="brand-dot"></span>
            <div className="brand-text">
              <strong>OTT SELLERS</strong>
              <span className="brand-badge">ADMIN CMS</span>
            </div>
          </Link>
          <button 
            type="button" 
            className="mobile-sidebar-close-btn"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navLinks.map((grp, gIdx) => (
            <div key={gIdx} className="admin-nav-group">
              <span className="admin-nav-group-title">{grp.group}</span>
              <ul className="admin-nav-list">
                {grp.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  return (
                    <li key={iIdx}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMobileSidebarOpen(false)}
                      >
                        <Icon size={18} className="admin-nav-icon" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with Live Store & Logout */}
        <div className="admin-sidebar-footer">
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="admin-footer-btn view-store"
          >
            <ExternalLink size={16} />
            <span>Open Customer Store</span>
          </a>

          <div className="admin-user-info-row">
            <div className="admin-user-avatar">
              <ShieldCheck size={18} />
            </div>
            <div className="admin-user-meta">
              <strong className="admin-user-email" title={adminUser?.email}>
                {adminUser?.email || 'Fixyourmobiles7@gmail.com'}
              </strong>
              <span className="admin-user-role">Super Administrator</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleLogout}
            className="admin-logout-btn"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="admin-main-viewport">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button 
              type="button" 
              className="mobile-hamburger-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>
            <div className="topbar-title-block">
              <span className="topbar-breadcrumb">Admin CMS / {location.pathname.replace('/admin/', '').replace('-', ' ') || 'Dashboard'}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="db-sync-status-pill">
              <Database size={14} color="#10b981" />
              <span>Supabase Database Active</span>
            </div>

            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="topbar-live-store-btn"
            >
              <span>View Live Website</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </header>

        {/* Page Content Rendered Here */}
        <main className="admin-page-content-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
