import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, ShieldCheck, ShoppingBag } from 'lucide-react';
import { ottApi } from '../services/api';
import { Order } from '../types';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { EmptyState } from '../components/common/EmptyState';
import './AccountPage.css';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadOrders = async () => {
      setLoading(true);
      const data = await ottApi.getOrders();
      setOrders(data);
      setLoading(false);
    };
    loadOrders();
  }, []);

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
      case 'Cancelled':
        return <span className="status-badge cancelled">{status}</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="account-page">
      <div className="container">
        <Breadcrumb 
          items={[
            { label: 'My Account', to: '/account' },
            { label: 'Order History' }
          ]} 
        />

        <div className="orders-page-header">
          <div>
            <h1 className="orders-page-title">My Orders & Subscriptions</h1>
            <p className="orders-page-desc">
              Track the dispatch status and credentials of all your current and past subscriptions.
            </p>
          </div>
          <Link to="/catalogs" className="btn-primary">
            + New Subscription
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="You haven't placed any orders yet"
            description="Explore our top streaming subscriptions and save up to 70% with instant WhatsApp activation."
            actionText="START SHOPPING"
            actionTo="/catalogs"
          />
        ) : (
          <div className="orders-table-wrapper">
            <div className="orders-card-list">
              {orders.map(order => (
                <div key={order.id} className="order-history-card">
                  <div className="order-history-header">
                    <div className="order-id-group">
                      <span className="order-id-code">{order.id}</span>
                      <span className="order-placed-date">Placed on {order.date}</span>
                    </div>

                    <div className="order-status-group">
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </div>

                  <div className="order-history-body">
                    <div className="order-items-listing">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-chip">
                          <span className="item-name-bold">{item.name}</span>
                          <span className="item-qty-tag">Qty: {item.quantity}</span>
                          <span className="item-price-tag">₹ {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-payment-meta">
                      <span className="payment-label">Payment:</span>
                      <span className="payment-value">{order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="order-history-footer">
                    <div className="order-total-block">
                      <span className="total-label">Total Amount:</span>
                      <span className="total-val">₹ {order.total}</span>
                    </div>

                    <Link to={`/account/orders/${order.id}`} className="btn-view-order-details">
                      <span>View Order Credentials</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
