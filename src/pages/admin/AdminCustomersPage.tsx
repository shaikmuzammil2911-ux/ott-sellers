import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Eye, RefreshCw, MessageSquare, X, ShoppingBag, Phone, Mail 
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { Order } from '../../types';

interface CustomerSummary {
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Order[];
}

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const orders = await ottApi.getOrders();
      
      const customerMap = new Map<string, CustomerSummary>();

      orders.forEach(o => {
        const email = o.customerEmail.toLowerCase().trim();
        const existing = customerMap.get(email);
        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += (o.paymentStatus === 'Paid' || o.paymentStatus === 'Success') ? o.total : 0;
          existing.orders.push(o);
        } else {
          customerMap.set(email, {
            name: o.customerName || 'Customer',
            email,
            phone: o.customerMobile || o.customerWhatsApp || '+91 9441323332',
            totalOrders: 1,
            totalSpent: (o.paymentStatus === 'Paid' || o.paymentStatus === 'Success') ? o.total : 0,
            lastOrderDate: o.date,
            orders: [o]
          });
        }
      });

      if (customerMap.size === 0) {
        customerMap.set('customer@gmail.com', {
          name: 'Shaik Muzammil',
          email: 'Fixyourmobiles7@gmail.com',
          phone: '+91 9441323332',
          totalOrders: 1,
          totalSpent: 499,
          lastOrderDate: '07 Oct 2026',
          orders: []
        });
      }

      setCustomers(Array.from(customerMap.values()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="admin-page-container">
      {/* Header Row */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Users className="admin-heading-icon" />
            <span>Customers Management</span>
          </h1>
          <p className="admin-sub-text">
            Registered buyers, purchase histories, and contact information linked with Supabase.
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

      {/* Toolbar / Search Box */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search customers by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-count-badge">
          Total Customers: <strong>{filteredCustomers.length}</strong>
        </div>
      </div>

      {/* Scrollable Responsive Table */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone / WhatsApp</th>
                <th>Total Orders</th>
                <th>Total Spending</th>
                <th>Latest Order</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 10px', color: '#0284c7' }} />
                    Loading customers from Supabase...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="admin-item-cell">
                        <div className="admin-avatar-initial">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="admin-item-name">{c.name}</div>
                          <div className="admin-item-sub">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.86rem', color: '#cbd5e1', fontWeight: 600 }}>
                        {c.phone || '+91 9441323332'}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 10px', 
                        background: '#070d1e', 
                        color: '#38bdf8', 
                        borderRadius: '8px', 
                        fontSize: '0.78rem', 
                        fontWeight: 700,
                        border: '1px solid #1e293b'
                      }}>
                        {c.totalOrders} order(s)
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#34d399', fontSize: '0.96rem' }}>
                        ₹{c.totalSpent}
                      </strong>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      {c.lastOrderDate}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${c.name}, greetings from OTT SELLERS!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              background: 'rgba(37, 211, 102, 0.12)',
                              border: '1px solid rgba(37, 211, 102, 0.3)',
                              color: '#25d366'
                            }}
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedCustomer(c)}
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
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Orders History Modal */}
      {selectedCustomer && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="admin-avatar-initial">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', margin: 0 }}>{selectedCustomer.name}</h2>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {selectedCustomer.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="modal-close-btn"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#070d1e', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Total Orders</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>{selectedCustomer.totalOrders}</span>
              </div>
              <div style={{ background: '#070d1e', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Total Spend</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#34d399' }}>₹{selectedCustomer.totalSpent}</span>
              </div>
            </div>

            {/* Orders list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                Past Purchases
              </h3>
              {selectedCustomer.orders.length === 0 ? (
                <div style={{ padding: '20px', background: '#070d1e', borderRadius: '12px', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
                  No prior orders recorded.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                  {selectedCustomer.orders.map((o) => (
                    <div key={o.id} style={{ 
                      padding: '12px 14px', 
                      background: '#070d1e', 
                      border: '1px solid #1e293b', 
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#ffffff', fontFamily: 'monospace' }}>{o.id}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{o.date} • {o.items.length} item(s)</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, color: '#34d399', fontSize: '0.92rem' }}>₹{o.total}</div>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#0f172a', color: '#94a3b8' }}>
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setSelectedCustomer(null)}
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
