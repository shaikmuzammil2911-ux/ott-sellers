import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Eye, CheckCircle2, Clock, 
  XCircle, RefreshCw, MessageSquare, X 
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const ords = await ottApi.getOrders();
      setOrders(ords);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    orderId: string, 
    orderStatus: Order['orderStatus'], 
    paymentStatus?: Order['paymentStatus']
  ) => {
    setIsUpdatingStatus(true);
    try {
      await ottApi.updateOrderStatus(orderId, orderStatus, paymentStatus);
      await ottApi.logAudit('UPDATE_ORDER_STATUS', 'orders', orderId, { orderStatus, paymentStatus });
      setUpdateMsg('Order status updated successfully in Supabase!');
      setTimeout(() => setUpdateMsg(null), 3000);
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus, ...(paymentStatus ? { paymentStatus } : {}) } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, orderStatus, ...(paymentStatus ? { paymentStatus } : {}) } : null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerMobile && o.customerMobile.includes(searchQuery));

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return o.orderStatus === 'Pending' || o.orderStatus === 'Processing';
    if (statusFilter === 'PAID') return o.paymentStatus === 'Paid' || o.paymentStatus === 'Success';
    if (statusFilter === 'COMPLETED') return o.orderStatus === 'Completed' || o.orderStatus === 'Delivered';
    if (statusFilter === 'CANCELLED') return o.orderStatus === 'Cancelled';
    return true;
  });

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}><CheckCircle2 size={12} /> Completed</span>;
      case 'Processing':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}><Clock size={12} /> Processing</span>;
      case 'Pending':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}><Clock size={12} /> Pending</span>;
      case 'Cancelled':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}><XCircle size={12} /> Cancelled</span>;
      default:
        return <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: '#070d1e', color: '#cbd5e1', border: '1px solid #1e293b' }}>{status}</span>;
    }
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'Paid':
      case 'Success':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>PAID</span>;
      case 'Pending':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>UNPAID</span>;
      case 'Failed':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>FAILED</span>;
      default:
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, background: '#070d1e', color: '#94a3b8' }}>{status}</span>;
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <ShoppingCart className="admin-heading-icon" />
            <span>Orders & Transactions</span>
          </h1>
          <p className="admin-sub-text">
            Authoritative order log, customer details, and live status verification from Supabase.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh database"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search order ID, customer, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        {/* Status filter tabs */}
        <div className="admin-tabs-row">
          {['ALL', 'PENDING', 'PAID', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`admin-tab-btn ${statusFilter === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-data-table" style={{ minWidth: '780px' }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 10px', color: '#0284c7' }} />
                    Loading orders from Supabase...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '0.88rem' }}>{o.id}</strong>
                    </td>
                    <td>
                      <div className="admin-item-name">{o.customerName}</div>
                      <div className="admin-item-sub">{o.customerEmail}</div>
                      {o.customerMobile && (
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{o.customerMobile}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {o.date}
                    </td>
                    <td>
                      <div style={{ fontWeight: 900, color: '#34d399', fontSize: '1rem' }}>₹{o.total}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{o.items.length} item(s)</div>
                    </td>
                    <td>
                      {getPaymentBadge(o.paymentStatus)}
                    </td>
                    <td>
                      {getStatusBadge(o.orderStatus)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#0f172a',
                          border: '1px solid #1e293b',
                          borderRadius: '8px',
                          color: '#cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="admin-modal-header">
              <div>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Order #{selectedOrder.id}</h2>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Placed on {selectedOrder.date}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="modal-close-btn"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {updateMsg && (
              <div className="admin-alert-banner" style={{ marginBottom: '16px' }}>
                {updateMsg}
              </div>
            )}

            {/* Customer Details Card */}
            <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>
                Customer Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Name:</span>
                  <strong style={{ color: '#ffffff' }}>{selectedOrder.customerName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Email:</span>
                  <span style={{ color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedOrder.customerEmail}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Phone:</span>
                  <span style={{ color: '#cbd5e1' }}>{selectedOrder.customerMobile || 'Not provided'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>WhatsApp:</span>
                  <a
                    href={`https://wa.me/${(selectedOrder.customerWhatsApp || selectedOrder.customerMobile || '919441323332').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedOrder.customerName}, this is OTT SELLERS Regarding your Order #${selectedOrder.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#25d366', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <MessageSquare size={14} /> Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Purchased Items */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
                Items ({selectedOrder.items.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} style={{ padding: '12px', background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '0.88rem' }}>{it.name}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{it.planDuration} • Qty: {it.quantity}</div>
                      {it.credentials && (
                        <div style={{ marginTop: '6px', padding: '6px 8px', background: '#050a18', border: '1px solid #1e293b', borderRadius: '6px', fontSize: '0.74rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                          Credentials: {typeof it.credentials === 'string' 
                            ? it.credentials 
                            : `${it.credentials.email || ''} | PIN: ${it.credentials.profilePin || ''} ${it.credentials.instruction ? `(${it.credentials.instruction})` : ''}`}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#34d399', fontSize: '0.94rem' }}>₹{it.price * it.quantity}</strong>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#050a18', border: '1px solid #1e293b', borderRadius: '10px', marginTop: '10px' }}>
                <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.86rem' }}>Total Verified Price</span>
                <strong style={{ color: '#34d399', fontSize: '1.2rem' }}>₹{selectedOrder.total}</strong>
              </div>
            </div>

            {/* Status Modifiers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Order Status</label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as any)}
                  disabled={isUpdatingStatus}
                  style={{ width: '100%', padding: '10px', background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', color: '#ffffff', fontSize: '0.85rem' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Payment Status</label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus, e.target.value as any)}
                  disabled={isUpdatingStatus}
                  style={{ width: '100%', padding: '10px', background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', color: '#ffffff', fontSize: '0.85rem' }}
                >
                  <option value="Paid">Paid / Success</option>
                  <option value="Pending">Pending / Unpaid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: '10px 18px',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
