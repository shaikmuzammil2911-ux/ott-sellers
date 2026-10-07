import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, FolderTree, ShoppingCart, Users, DollarSign, Clock, 
  ArrowUpRight, Plus, RefreshCw, Star, Layers, Sparkles, 
  CheckCircle2, AlertCircle, ArrowRight, ExternalLink 
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { Order, Product } from '../../types';
import './AdminDashboard.css';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboardStats, orders, products] = await Promise.all([
        ottApi.getDashboardStats(),
        ottApi.getOrders(),
        ottApi.getProducts()
      ]);
      setStats(dashboardStats);
      setRecentOrders(orders.slice(0, 5));
      setRecentProducts(products.slice(0, 5));
    } catch (e) {
      console.error('Error loading dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalProducts,
      icon: Package,
      color: '#38bdf8',
      link: '/admin/products'
    },
    {
      title: 'Total Categories',
      value: stats.totalCategories,
      icon: FolderTree,
      color: '#a855f7',
      link: '/admin/categories'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: '#f59e0b',
      link: '/admin/orders'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: '#0284c7',
      link: '/admin/customers'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: '#10b981',
      link: '/admin/orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: '#f43f5e',
      link: '/admin/orders'
    }
  ];

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <span>Admin Control Dashboard</span>
          </h1>
          <p className="admin-sub-text">
            Live database overview, real order metrics, and quick content management shortcuts.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh database numbers"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-action"
          >
            <span>View Live Site</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* 1. Compact Statistics Grid */}
      <div className="admin-stats-grid compact">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="admin-stat-card compact">
              <div className="stat-card-header">
                <span className="stat-title">{card.title}</span>
                <div className="stat-icon-wrap" style={{ color: card.color, background: `${card.color}18` }}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="stat-card-body">
                <span className="stat-value">{card.value}</span>
                <span className="stat-link-arrow">
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. Quick Actions Strip */}
      <div className="admin-quick-actions-strip">
        <span className="quick-actions-label">Quick Actions:</span>
        <div className="quick-actions-btns">
          <Link to="/admin/products" className="quick-action-btn">
            <Plus size={14} />
            <span>Add Item</span>
          </Link>
          <Link to="/admin/banners" className="quick-action-btn">
            <Plus size={14} />
            <span>Create Banner</span>
          </Link>
          <Link to="/admin/categories" className="quick-action-btn">
            <Plus size={14} />
            <span>Add Category</span>
          </Link>
          <Link to="/admin/hero" className="quick-action-btn">
            <Layers size={14} />
            <span>Sections ON/OFF</span>
          </Link>
          <Link to="/admin/notifications" className="quick-action-btn">
            <Sparkles size={14} />
            <span>Live Popups CMS</span>
          </Link>
        </div>
      </div>

      {/* 3. Split Layout: Recent Orders & Recent Items */}
      <div className="admin-split-grid">
        {/* Recent Orders Table */}
        <div className="admin-card-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <ShoppingCart size={18} className="panel-icon text-amber" />
              <h3>Recent Orders</h3>
            </div>
            <Link to="/admin/orders" className="panel-link">
              <span>View All ({stats.totalOrders})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="panel-body compact-table-wrap">
            {recentOrders.length === 0 ? (
              <p className="panel-empty-text">No orders received yet.</p>
            ) : (
              <table className="admin-compact-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td>
                        <strong className="order-number-text">{o.id}</strong>
                      </td>
                      <td>
                        <span className="table-customer-name">{o.customerName}</span>
                      </td>
                      <td>
                        <span className="table-total-amt">₹{o.total}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${o.orderStatus?.toLowerCase() || 'pending'}`}>
                          {o.orderStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Items / Subscriptions */}
        <div className="admin-card-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <Package size={18} className="panel-icon text-cyan" />
              <h3>Catalog Items</h3>
            </div>
            <Link to="/admin/products" className="panel-link">
              <span>View All ({stats.totalProducts})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="panel-body compact-table-wrap">
            {recentProducts.length === 0 ? (
              <p className="panel-empty-text">No products in catalog yet.</p>
            ) : (
              <table className="admin-compact-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong className="table-product-name">{p.name}</strong>
                      </td>
                      <td>
                        <span className="table-category-tag">{p.categoryName}</span>
                      </td>
                      <td>
                        <span className="table-price">₹{p.plans?.[0]?.price || p.price}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${p.status === 'ON' ? 'active' : 'inactive'}`}>
                          {p.status === 'ON' ? 'Live' : 'Hidden'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
