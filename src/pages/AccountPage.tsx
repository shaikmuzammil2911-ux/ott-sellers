import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Package, Clock, ShieldCheck, Heart, LogOut, 
  ChevronRight, Phone, Mail, MessageCircle, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ottApi } from '../services/api';
import { Order } from '../types';
import { Breadcrumb } from '../components/common/Breadcrumb';
import './AccountPage.css';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'support'>('profile');

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadOrders = async () => {
      const data = await ottApi.getOrders();
      setOrders(data);
    };
    loadOrders();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return <span className="status-badge delivered">{status}</span>;
      case 'Processing':
        return <span className="status-badge processing">{status}</span>;
      case 'Paid':
        return <span className="status-badge paid">{status}</span>;
      case 'Pending':
        return <span className="status-badge pending">{status}</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="account-page">
      <div className="container">
        <Breadcrumb items={[{ label: 'My Account' }]} />

        <div className="account-layout-grid">
          {/* Left Navigation Sidebar */}
          <aside className="account-nav-sidebar">
            <div className="account-user-card">
              <div className="user-avatar-circle">
                <User size={32} />
              </div>
              <div className="user-text-info">
                <h2 className="user-display-name">{user?.name || 'Customer'}</h2>
                <span className="user-join-date">Member since {user?.joinedDate || '2025'}</span>
              </div>
            </div>

            <nav className="account-menu-nav">
              <button
                type="button"
                className={`account-menu-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} />
                <span>My Profile</span>
              </button>

              <Link
                to="/account/orders"
                className="account-menu-link"
              >
                <Package size={18} />
                <span>Order History ({orders.length})</span>
                <ChevronRight size={16} className="menu-arrow" />
              </Link>

              <button
                type="button"
                className={`account-menu-link ${activeTab === 'support' ? 'active' : ''}`}
                onClick={() => setActiveTab('support')}
              >
                <MessageCircle size={18} />
                <span>Customer Support</span>
              </button>

              <button
                type="button"
                className="account-menu-link logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Right Content Panel */}
          <main className="account-main-content">
            {activeTab === 'profile' && (
              <div className="account-panel-card">
                <h2 className="panel-title">Personal Profile Information</h2>
                <p className="panel-sub">Manage your personal contacts for fast OTT account delivery.</p>

                <div className="profile-details-grid">
                  <div className="profile-detail-field">
                    <span className="field-label">Full Name</span>
                    <strong className="field-value">{user?.name || 'Muzammil Shaik'}</strong>
                  </div>

                  <div className="profile-detail-field">
                    <span className="field-label">Email Address</span>
                    <strong className="field-value">{user?.email || 'muzammil@example.com'}</strong>
                  </div>

                  <div className="profile-detail-field">
                    <span className="field-label">WhatsApp Delivery Mobile</span>
                    <strong className="field-value">{user?.whatsapp || '+91 98765 43210'}</strong>
                  </div>

                  <div className="profile-detail-field">
                    <span className="field-label">Account Security</span>
                    <strong className="field-value green-text">
                      <ShieldCheck size={16} /> Verified Active
                    </strong>
                  </div>
                </div>

                <div className="recent-orders-preview-section">
                  <div className="section-header">
                    <h3 className="section-title">
                      <span className="bar-indicator"></span>
                      <span>Recent Orders</span>
                    </h3>
                    <Link to="/account/orders" className="view-all-link">
                      <span>View All Orders →</span>
                    </Link>
                  </div>

                  <div className="recent-orders-list">
                    {orders.slice(0, 2).map(order => (
                      <Link
                        key={order.id}
                        to={`/account/orders/${order.id}`}
                        className="recent-order-row-card"
                      >
                        <div className="recent-order-main">
                          <span className="order-id-badge">{order.id}</span>
                          <span className="order-date-text">{order.date}</span>
                          <p className="order-items-summary">
                            {order.items.map(i => i.name).join(', ')}
                          </p>
                        </div>

                        <div className="recent-order-right">
                          <span className="order-price-bold">₹ {order.total}</span>
                          {getStatusBadge(order.orderStatus)}
                          <ChevronRight size={18} className="arrow-icon" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="account-panel-card">
                <h2 className="panel-title">Customer Support Helpdesk</h2>
                <p className="panel-sub">Need assistance with login credentials, device setup or renewals?</p>

                <div className="support-channels-grid">
                  <a 
                    href="https://wa.me/919441323332?text=Hi%20OTT%20Sellers%2C%20I%20need%20customer%20support%20assistance."
                    target="_blank"
                    rel="noreferrer"
                    className="support-channel-card whatsapp"
                  >
                    <MessageCircle size={32} className="support-icon" />
                    <h4>WhatsApp Support (Fastest)</h4>
                    <p>Live human response within 2-5 minutes. Available 24 hours.</p>
                    <span className="channel-action">Chat on WhatsApp →</span>
                  </a>

                  <div className="support-channel-card email">
                    <Mail size={32} className="support-icon" />
                    <h4>Email Inquiries</h4>
                    <p>helpdesk@ottsellers.vip</p>
                    <span className="channel-action">Response in 1 hour</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
