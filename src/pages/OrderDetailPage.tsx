import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Clock, ShieldCheck, Key, 
  MessageCircle, Copy, Check, FileText 
} from 'lucide-react';
import { ottApi } from '../services/api';
import { Order } from '../types';
import { Breadcrumb } from '../components/common/Breadcrumb';
import './AccountPage.css';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadOrder = async () => {
      if (!id) return;
      setLoading(true);
      const data = await ottApi.getOrderById(id);
      if (data) {
        setOrder(data);
      }
      setLoading(false);
    };
    loadOrder();
  }, [id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <p>We could not locate an order matching ID "{id}".</p>
        <Link to="/account/orders" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const whatsappMessage = `Hi OTT Sellers, I need help with Order ${order.id}.`;
  const whatsappUrl = `https://wa.me/919441323332?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="account-page order-detail-view">
      <div className="container">
        <Breadcrumb 
          items={[
            { label: 'My Account', to: '/account' },
            { label: 'Orders', to: '/account/orders' },
            { label: order.id }
          ]} 
        />

        <div className="order-detail-header-card">
          <div className="order-detail-title-col">
            <Link to="/account/orders" className="back-orders-link">
              <ArrowLeft size={16} /> All Orders
            </Link>
            <h1 className="order-headline">Order Details: {order.id}</h1>
            <span className="order-meta-date">Placed on {order.date} • Paid via {order.paymentMethod}</span>
          </div>

          <div className="order-status-pill-big">
            <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
              {order.orderStatus}
            </span>
          </div>
        </div>

        <div className="order-detail-grid">
          {/* Main Column: Credentials & Items */}
          <div className="order-detail-main">
            {/* Credentials / Delivery Card */}
            <div className="credentials-vault-card">
              <div className="vault-header">
                <Key size={20} className="vault-icon" />
                <h3 className="vault-title">Subscription Credentials & Activation Details</h3>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="credentials-item-box">
                  <h4 className="item-vault-name">{item.name}</h4>
                  
                  {item.credentials ? (
                    typeof item.credentials === 'string' ? (
                      <div className="credentials-fields">
                        <div className="cred-field-row">
                          <span className="cred-label">Credentials:</span>
                          <span className="cred-val">{item.credentials}</span>
                          <button
                            type="button"
                            className="btn-copy-cred"
                            onClick={() => copyToClipboard(typeof item.credentials === 'string' ? item.credentials : '', `cred-${idx}`)}
                          >
                            {copiedText === `cred-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="credentials-fields">
                        {item.credentials.email && (
                          <div className="cred-field-row">
                            <span className="cred-label">Login Account:</span>
                            <span className="cred-val">{item.credentials.email}</span>
                            <button
                              type="button"
                              className="btn-copy-cred"
                              onClick={() => copyToClipboard(typeof item.credentials === 'object' ? item.credentials.email || '' : '', `email-${idx}`)}
                            >
                              {copiedText === `email-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        )}

                        {item.credentials.profilePin && (
                          <div className="cred-field-row">
                            <span className="cred-label">Profile / PIN:</span>
                            <span className="cred-val highlight">{item.credentials.profilePin}</span>
                            <button
                              type="button"
                              className="btn-copy-cred"
                              onClick={() => copyToClipboard(typeof item.credentials === 'object' ? item.credentials.profilePin || '' : '', `pin-${idx}`)}
                            >
                              {copiedText === `pin-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        )}

                        {item.credentials.instruction && (
                          <div className="cred-instruction-note">
                            <strong>Instructions:</strong> {item.credentials.instruction}
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="cred-pending-state">
                      <Clock size={16} />
                      <span>Credentials being dispatched via WhatsApp to {order.customerWhatsApp}...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Items Purchased Card */}
            <div className="order-items-detail-card">
              <h3 className="card-heading">Purchased Subscriptions</h3>
              <div className="purchased-items-table">
                {order.items.map((item, idx) => (
                  <div key={idx} className="purchased-item-row">
                    <div className="item-name-col">
                      <strong>{item.name}</strong>
                      <span>Duration: {item.planDuration}</span>
                    </div>
                    <span className="item-qty">Qty: {item.quantity}</span>
                    <span className="item-amount">₹ {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column: Customer Info & Support */}
          <div className="order-detail-sidebar">
            <div className="order-summary-box">
              <h3 className="box-title">Order Financials</h3>
              <div className="financials-rows">
                <div className="fin-row">
                  <span>Subtotal</span>
                  <span>₹ {order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div className="fin-row discount">
                    <span>Discount</span>
                    <span>- ₹ {order.discount}</span>
                  </div>
                )}
                <div className="fin-row total">
                  <span>Grand Total</span>
                  <span className="total-num">₹ {order.total}</span>
                </div>
              </div>

              <div className="order-customer-box">
                <span className="box-sub">Recipient Information</span>
                <p><strong>{order.customerName}</strong></p>
                <p>WhatsApp: {order.customerWhatsApp}</p>
                <p>Email: {order.customerEmail}</p>
              </div>

              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-order-whatsapp-help"
              >
                <MessageCircle size={18} />
                <span>Help with this Order</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
