import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, FolderTree, Image as ImageIcon, 
  Sparkles, ShoppingCart, Users, Star, Settings, LogOut, 
  ExternalLink, Menu, X, ShieldCheck, Database, Bell, CreditCard, Mail, Tag, Gift 
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ADMIN_CONFIG } from '../../services/api';
import './AdminLayout.css';
import './AdminMobile.css';

export const AdminLayout: React.FC = () => {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Sidebar navigation structure matching requirements
  const navLinks = [
    {
      group: 'MAIN',
      items: [
        { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'STOREFRONT CMS',
      items: [
        { label: 'Homepage & Hero', to: '/admin/hero', icon: Sparkles },
        { label: 'Banners & Slots', to: '/admin/banners', icon: ImageIcon },
        { label: 'Categories', to: '/admin/categories', icon: FolderTree },
        { label: 'Reviews', to: '/admin/reviews', icon: Star },
        { label: 'Notifications', to: '/admin/notifications', icon: Bell }
      ]
    },
    {
      group: 'PRODUCTS & OFFERS',
      items: [
        { label: 'Items & Plans', to: '/admin/products', icon: Package },
        { label: 'Coupons & Promos', to: '/admin/coupons', icon: Tag }
      ]
    },
    {
      group: 'SALES & CUSTOMERS',
      items: [
        { label: 'Orders & Payments', to: '/admin/orders', icon: ShoppingCart },
        { label: 'Customer Base', to: '/admin/customers', icon: Users }
      ]
    },
    {
      group: 'SYSTEM & SETTINGS',
      items: [
        { label: 'Website & WhatsApp CMS', to: '/admin/settings', icon: Settings },
        { label: 'Admin Security (OTP)', to: '/admin/settings', icon: ShieldCheck }
      ]
    }
  ];

  const adminEmail = adminUser?.email || ADMIN_CONFIG.EMAIL;

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
            <X size={18} />
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
                        <Icon size={16} className="admin-nav-icon" />
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
            <ExternalLink size={14} />
            <span>Open Customer Store</span>
          </a>

          <div className="admin-user-info-row">
            <div className="admin-user-avatar">
              <ShieldCheck size={16} />
            </div>
            <div className="admin-user-meta">
              <strong className="admin-user-email" title={adminEmail}>
                {adminEmail}
              </strong>
              <span className="admin-user-role">Super Administrator</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleLogout}
            className="admin-logout-btn"
          >
            <LogOut size={14} />
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
              <Menu size={20} />
            </button>
            <div className="topbar-title-block">
              <span className="topbar-breadcrumb">
                Admin CMS / {location.pathname.replace('/admin/', '').replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="db-sync-status-pill">
              <Database size={13} color="#10b981" />
              <span>Supabase Live Sync</span>
            </div>

            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="topbar-live-store-btn"
            >
              <span>View Website</span>
              <ExternalLink size={13} />
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
