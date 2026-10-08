import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Search, Edit2, Trash2, Check, X, 
  RefreshCw, AlertCircle, Eye, EyeOff, Calendar, 
  DollarSign, Percent, Sparkles, Copy 
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { Coupon } from '../../types';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [formDiscountValue, setFormDiscountValue] = useState('10');
  const [formMinOrder, setFormMinOrder] = useState('');
  const [formMaxDiscount, setFormMaxDiscount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ottApi.getCoupons();
      setCoupons(data);
    } catch (e) {
      console.error(e);
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

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleGenerateCode = () => {
    const generated = ottApi.generateCouponCode(formDiscountType === 'percentage' ? 'SAVE' : 'FLAT');
    setFormCode(generated);
  };

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormCode(ottApi.generateCouponCode('OTT'));
    setFormDiscountType('percentage');
    setFormDiscountValue('15');
    setFormMinOrder('299');
    setFormMaxDiscount('200');
    setFormDescription('Special promotional discount');
    setFormExpiresAt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setFormCode(c.code);
    setFormDiscountType(c.discountType);
    setFormDiscountValue(String(c.discountValue));
    setFormMinOrder(c.minOrderAmount ? String(c.minOrderAmount) : '');
    setFormMaxDiscount(c.maxDiscount ? String(c.maxDiscount) : '');
    setFormDescription(c.description || '');
    setFormExpiresAt(c.expiresAt ? c.expiresAt.split('T')[0] : '');
    setFormIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      alert('Coupon code is required.');
      return;
    }

    const couponData: Coupon = {
      id: editingCoupon?.id || 'coup-' + Date.now(),
      code: formCode.trim().toUpperCase(),
      discountType: formDiscountType,
      discountValue: Number(formDiscountValue) || 0,
      minOrderAmount: formMinOrder ? Number(formMinOrder) : undefined,
      maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
      description: formDescription.trim(),
      expiresAt: formExpiresAt ? new Date(formExpiresAt).toISOString() : undefined,
      isActive: formIsActive
    };

    await ottApi.saveCoupon(couponData);
    await ottApi.logAudit(editingCoupon ? 'UPDATE_COUPON' : 'CREATE_COUPON', 'coupons', couponData.id, { code: couponData.code });
    showToast(`Coupon "${couponData.code}" saved and synced!`);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      await ottApi.deleteCoupon(id);
      await ottApi.logAudit('DELETE_COUPON', 'coupons', id, { code });
      showToast('Coupon deleted.');
      await loadData();
    }
  };

  const handleToggleStatus = async (c: Coupon) => {
    const updated = { ...c, isActive: !c.isActive };
    await ottApi.saveCoupon(updated);
    showToast(`Coupon ${c.code} is now ${updated.isActive ? 'ACTIVE' : 'INACTIVE'}.`);
    await loadData();
  };

  const filteredCoupons = coupons.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = c.code.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
    if (!matchesQuery) return false;
    if (statusFilter === 'active' && !c.isActive) return false;
    if (statusFilter === 'inactive' && c.isActive) return false;
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Tag className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Coupon & Discount Management</span>
          </h1>
          <p className="admin-sub-text">
            Create unique discount codes, set percentage or flat deductions, minimum cart value, and expiry limits.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh from database"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary-action"
          >
            <Plus size={16} />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-select-filter"
        >
          <option value="all">All Coupons</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Coupons Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Max Cap</th>
              <th>Status</th>
              <th>Expiry</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-muted)' }}>
                  No coupons found. Click <strong>+ Create New Coupon</strong> to add your first promotion.
                </td>
              </tr>
            ) : (
              filteredCoupons.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.92rem', 
                        fontWeight: 800, 
                        background: '#f1f5f9', 
                        padding: '4px 8px', 
                        borderRadius: '6px',
                        letterSpacing: '0.04em',
                        color: 'var(--admin-primary)'
                      }}>
                        {c.code}
                      </span>
                      {c.description && (
                        <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                          ({c.description})
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--admin-text-main)' }}>
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                    </strong>
                  </td>
                  <td>
                    {c.minOrderAmount ? `₹${c.minOrderAmount}` : 'No minimum'}
                  </td>
                  <td>
                    {c.maxDiscount ? `₹${c.maxDiscount}` : 'No limit'}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c)}
                      className={`admin-badge ${c.isActive ? 'active' : 'inactive'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to toggle active status"
                    >
                      {c.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{c.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                    </button>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c)}
                        className="btn-refresh-action"
                        title="Edit coupon"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="btn-refresh-action"
                        style={{ color: 'var(--admin-danger)' }}
                        title="Delete coupon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCoupon ? `Edit Coupon (${editingCoupon.code})` : 'Create New Coupon'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="admin-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              <div className="admin-modal-body">
                {/* Code Generation Row */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Coupon Code *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. OTT2026, SAVE20"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="btn-refresh-action"
                      style={{ whiteSpace: 'nowrap', display: 'inline-flex', gap: '6px', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700 }}
                      title="Generate unique random code"
                    >
                      <Sparkles size={14} color="#0284c7" />
                      <span>Auto Generate</span>
                    </button>
                  </div>
                </div>

                {/* Discount Type & Value */}
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Discount Type</label>
                    <select
                      className="admin-form-select"
                      value={formDiscountType}
                      onChange={(e) => setFormDiscountType(e.target.value as any)}
                    >
                      <option value="percentage">Percentage (%) Discount</option>
                      <option value="fixed">Flat Fixed (₹) Discount</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      {formDiscountType === 'percentage' ? 'Percentage Value (%) *' : 'Flat Amount (₹) *'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={formDiscountType === 'percentage' ? '100' : '5000'}
                      className="admin-form-input"
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Limits */}
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Min Cart Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-form-input"
                      placeholder="e.g. 299 (optional)"
                      value={formMinOrder}
                      onChange={(e) => setFormMinOrder(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-form-input"
                      placeholder="e.g. 500 (optional)"
                      value={formMaxDiscount}
                      onChange={(e) => setFormMaxDiscount(e.target.value)}
                      disabled={formDiscountType === 'fixed'}
                    />
                  </div>
                </div>

                {/* Description & Expiry */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Coupon Description</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Flash festive sale 15% discount on all subscriptions"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Expiration Date</label>
                    <input
                      type="date"
                      className="admin-form-input"
                      value={formExpiresAt}
                      onChange={(e) => setFormExpiresAt(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Status</label>
                    <select
                      className="admin-form-select"
                      value={formIsActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormIsActive(e.target.value === 'active')}
                    >
                      <option value="active">Active (Usable on Storefront)</option>
                      <option value="inactive">Inactive (Disabled)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-refresh-action"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                >
                  <Check size={16} />
                  <span>{editingCoupon ? 'Update Coupon' : 'Save Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
