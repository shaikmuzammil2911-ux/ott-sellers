import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Filter, Eye, CheckCircle2, Clock, 
  XCircle, AlertTriangle, RefreshCw, MessageSquare, Phone, 
  Mail, Calendar, CreditCard, ShieldCheck, X 
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
      
      // Update local state
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
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'Processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30"><Clock className="w-3 h-3" /> Processing</span>;
      case 'Pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30"><Clock className="w-3 h-3" /> Pending</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">{status}</span>;
    }
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'Paid':
      case 'Success':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300">Paid</span>;
      case 'Pending':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300">Unpaid</span>;
      case 'Failed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300">Failed</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-primary-500" />
            Orders & Transactions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Authoritative order log, customer details, and live status verification from Supabase.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh database"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, customer, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'PAID', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab 
                  ? 'bg-primary-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Fulfillment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                    Loading orders from Supabase...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {o.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{o.customerName}</div>
                      <div className="text-xs text-slate-400">{o.customerEmail}</div>
                      {o.customerMobile && (
                        <div className="text-xs text-slate-500">{o.customerMobile}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {o.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-400 text-base">₹{o.total}</div>
                      <div className="text-[11px] text-slate-500">{o.items.length} item(s)</div>
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(o.paymentStatus)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(o.orderStatus)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary-500" />
                  Order #{selectedOrder.id}
                </h2>
                <span className="text-xs text-slate-400">Placed on {selectedOrder.date}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
                {updateMsg}
              </div>
            )}

            {/* Customer Details Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Full Name:</span>
                  <span className="font-semibold text-white">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Email Address:</span>
                  <span className="text-slate-300 font-mono text-xs">{selectedOrder.customerEmail}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Phone / Mobile:</span>
                  <span className="text-slate-300">{selectedOrder.customerMobile || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">WhatsApp:</span>
                  <a
                    href={`https://wa.me/${(selectedOrder.customerWhatsApp || selectedOrder.customerMobile || '919441323332').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedOrder.customerName}, this is OTT SELLERS Regarding your Order #${selectedOrder.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline text-xs font-semibold"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Purchased Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Items ({selectedOrder.items.length})</h3>
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-bold text-white">{it.name}</div>
                      <div className="text-xs text-slate-400">{it.planDuration} • Qty: {it.quantity}</div>
                      {it.credentials && (
                        <div className="mt-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-primary-300">
                          Credentials: {typeof it.credentials === 'string' 
                            ? it.credentials 
                            : `${it.credentials.email || ''} | PIN: ${it.credentials.profilePin || ''} ${it.credentials.instruction ? `(${it.credentials.instruction})` : ''}`}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">₹{it.price * it.quantity}</div>
                      <div className="text-[11px] text-slate-500">₹{it.price} each</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl font-bold">
                <span className="text-slate-300">Total Authoritative Price</span>
                <span className="text-xl text-emerald-400">₹{selectedOrder.total}</span>
              </div>
            </div>

            {/* Status Modifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Update Order Status</label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as any)}
                  disabled={isUpdatingStatus}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Update Payment Status</label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus, e.target.value as any)}
                  disabled={isUpdatingStatus}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="Paid">Paid / Success</option>
                  <option value="Pending">Pending / Unpaid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
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
