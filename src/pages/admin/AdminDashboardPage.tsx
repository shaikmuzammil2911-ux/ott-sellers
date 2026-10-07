import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, GraduationCap, FolderTree, Users, ShoppingCart, 
  Clock, CheckCircle, XCircle, IndianRupee, ArrowUpRight, 
  PlusCircle, Database, Sparkles, RefreshCw, FileText 
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { Order } from '../../types';
import './AdminDashboard.css';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState(() => {
    const prods = ottApi.getCachedProductsAdmin();
    const crss = ottApi.getCachedCoursesAdmin();
    const cats = ottApi.getCachedCategoriesAdmin();
    return {
      totalProducts: prods.length,
      totalCourses: crss.length,
      totalCategories: cats.length,
      totalOrders: 6,
      totalCustomers: 48,
      totalRevenue: 24900,
      pendingOrders: 2,
      completedOrders: 4,
      cancelledOrders: 0,
      todayOrdersCount: 2,
      todayRevenue: 1598
    };
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metrics, orders] = await Promise.all([
        ottApi.getDashboardStats(),
        ottApi.getOrders()
      ]);
      setStats(metrics);
      setRecentOrders(orders.slice(0, 6));
    } catch (e) {
      console.error('Error fetching dashboard statistics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('ott_data_updated', handleUpdate);
    return () => window.removeEventListener('ott_data_updated', handleUpdate);
  }, []);

  return (
    <div className="admin-page-container">
      {/* Responsive Header Row */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Sparkles className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>E-Commerce Control Center</span>
          </h1>
          <p className="admin-sub-text">
            Real-time telemetry, authoritative Supabase records & storefront activity.
          </p>
        </div>
        <div className="admin-header-actions">
          <button 
            type="button" 
            onClick={loadData} 
            className="btn-refresh-action"
            title="Refresh database records"
          >
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
          </button>
          <Link to="/admin/products" className="btn-primary-action">
            <PlusCircle size={16} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-stats-grid">
        <div className="stat-metric-card revenue">
          <div className="stat-card-icon-box gold">
            <IndianRupee size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Revenue</span>
            <h2 className="stat-card-number">₹ {stats.totalRevenue.toLocaleString()}</h2>
            <span className="stat-card-trend">Across {stats.totalOrders} total orders</span>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-icon-box blue">
            <ShoppingCart size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Orders</span>
            <h2 className="stat-card-number">{stats.totalOrders}</h2>
            <span className="stat-card-trend positive">{stats.todayOrdersCount} orders placed today</span>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-icon-box purple">
            <Users size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Customers</span>
            <h2 className="stat-card-number">{stats.totalCustomers}</h2>
            <span className="stat-card-trend">Active registered accounts</span>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-icon-box red">
            <Package size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Active Products</span>
            <h2 className="stat-card-number">{stats.totalProducts}</h2>
            <span className="stat-card-trend">OTT Subscriptions & Passes</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="admin-sub-metrics-row">
        <div className="sub-metric-pill">
          <Clock size={16} color="#f59e0b" />
          <span>Pending Orders: <strong>{stats.pendingOrders}</strong></span>
        </div>
        <div className="sub-metric-pill">
          <CheckCircle size={16} color="#10b981" />
          <span>Completed Orders: <strong>{stats.completedOrders}</strong></span>
        </div>
        <div className="sub-metric-pill">
          <GraduationCap size={16} color="#0284c7" />
          <span>Courses & Bundles: <strong>{stats.totalCourses}</strong></span>
        </div>
        <div className="sub-metric-pill">
          <FolderTree size={16} color="#ec4899" />
          <span>Categories: <strong>{stats.totalCategories}</strong></span>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="admin-quick-actions-bar">
        <h3>Quick Administrative Actions</h3>
        <div className="quick-actions-buttons">
          <Link to="/admin/products" className="quick-action-btn">
            <Package size={16} />
            <span>Manage Products</span>
          </Link>
          <Link to="/admin/courses" className="quick-action-btn">
            <GraduationCap size={16} />
            <span>Manage Courses</span>
          </Link>
          <Link to="/admin/categories" className="quick-action-btn">
            <FolderTree size={16} />
            <span>Manage Categories</span>
          </Link>
          <Link to="/admin/hero" className="quick-action-btn">
            <Sparkles size={16} />
            <span>Edit Hero CMS</span>
          </Link>
          <Link to="/admin/banners" className="quick-action-btn">
            <FileText size={16} />
            <span>Manage Banners</span>
          </Link>
          <Link to="/admin/orders" className="quick-action-btn">
            <ShoppingCart size={16} />
            <span>View All Orders</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="dashboard-section-block">
        <div className="section-title-row">
          <div>
            <h3>Recent Store Orders</h3>
            <p>Latest customer purchases synchronized with Supabase database.</p>
          </div>
          <Link to="/admin/orders" className="view-more-link">
            <span>View All Orders ({stats.totalOrders})</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="admin-table-container">
          <div className="admin-table-scroll">
            <table className="admin-table" style={{ minWidth: '760px' }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items Ordered</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                      No orders recorded in database yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{order.id}</strong>
                      </td>
                      <td>{order.date}</td>
                      <td>
                        <div className="order-customer-cell">
                          <strong>{order.customerName}</strong>
                          <span>{order.customerEmail}</span>
                        </div>
                      </td>
                      <td>
                        <span className="items-summary-tag">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} ({order.items[0]?.name})
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#10b981' }}>₹ {order.total}</strong>
                      </td>
                      <td>
                        <span className={`status-badge ${order.paymentStatus.toLowerCase()}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>
                        <Link to="/admin/orders" className="table-inline-action-btn">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
