import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Search, Edit2, Trash2, Check, X, 
  RefreshCw, AlertCircle, Eye, EyeOff, Calendar, 
  DollarSign, Percent, Sparkles, Copy, Clock, MessageSquare, CheckSquare, Square, Info
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { Coupon, Category, Product, CouponApplicability } from '../../types';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [formDiscountValue, setFormDiscountValue] = useState('15');
  const [formMinOrder, setFormMinOrder] = useState('');
  const [formMaxDiscount, setFormMaxDiscount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  
  // Date & Time Window
  const [formStartDate, setFormStartDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('00:00');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formExpiryTime, setFormExpiryTime] = useState('23:59');

  // Customer Facing Heading & Custom Messages (Module 7.4)
  const [formMessageHeading, setFormMessageHeading] = useState('Special Discount Deal');
  const [formCustomerMessage, setFormCustomerMessage] = useState('Get instant discount on your subscription order today!');
  const [formExpiredMessage, setFormExpiredMessage] = useState('This coupon code has expired.');
  const [formInvalidMessage, setFormInvalidMessage] = useState('Invalid coupon code.');
  const [formNotStartedMessage, setFormNotStartedMessage] = useState('This coupon has not started yet.');
  const [formSuccessMessage, setFormSuccessMessage] = useState('Coupon applied successfully!');

  // Applicability & Item Selector Search
  const [formApplicability, setFormApplicability] = useState<CouponApplicability>('all');
  const [formApplicableCategorySlugs, setFormApplicableCategorySlugs] = useState<string[]>([]);
  const [formApplicableProductIds, setFormApplicableProductIds] = useState<string[]>([]);
  const [itemSearchText, setItemSearchText] = useState('');

  const [formIsActive, setFormIsActive] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cns, cats, prods] = await Promise.all([
        ottApi.getCoupons(),
        ottApi.getAllCategoriesAdmin(),
        ottApi.getAllProductsAdmin()
      ]);
      setCoupons(cns);
      setCategories(cats);
      setProducts(prods);
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
    
    const today = new Date().toISOString().split('T')[0];
    const monthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setFormStartDate(today);
    setFormStartTime('00:00');
    setFormExpiresAt(monthLater);
    setFormExpiryTime('23:59');

    setFormMessageHeading('Special Discount Deal');
    setFormCustomerMessage('Get instant discount on your subscription order today!');
    setFormExpiredMessage('This coupon code has expired.');
    setFormInvalidMessage('Invalid coupon code.');
    setFormNotStartedMessage('This coupon promotion has not started yet.');
    setFormSuccessMessage('Coupon applied successfully!');

    setFormApplicability('all');
    setFormApplicableCategorySlugs([]);
    setFormApplicableProductIds([]);
    setItemSearchText('');
    setFormIsActive(true);
    setFormError(null);
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
    
    setFormStartDate(c.startDate || '');
    setFormStartTime(c.startTime || '00:00');
    setFormExpiresAt(c.expiresAt ? c.expiresAt.split('T')[0] : '');
    setFormExpiryTime(c.expiryTime || '23:59');

    setFormMessageHeading(c.messageHeading || 'Special Discount Deal');
    setFormCustomerMessage(c.customerMessage || 'Get instant discount on your subscription order today!');
    setFormExpiredMessage(c.expiredMessage || 'This coupon code has expired.');
    setFormInvalidMessage(c.invalidMessage || 'Invalid coupon code.');
    setFormNotStartedMessage(c.notStartedMessage || 'This coupon promotion has not started yet.');
    setFormSuccessMessage(c.successMessage || 'Coupon applied successfully!');

    setFormApplicability(c.applicability || 'all');
    setFormApplicableCategorySlugs(c.applicableCategorySlugs || []);
    setFormApplicableProductIds(c.applicableProductIds || []);
    setItemSearchText('');
    setFormIsActive(c.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleCategorySelection = (slug: string) => {
    if (formApplicableCategorySlugs.includes(slug)) {
      setFormApplicableCategorySlugs(formApplicableCategorySlugs.filter(s => s !== slug));
    } else {
      setFormApplicableCategorySlugs([...formApplicableCategorySlugs, slug]);
    }
  };

  const handleToggleProductSelection = (id: string) => {
    if (formApplicability === 'single_item') {
      setFormApplicableProductIds([id]);
      return;
    }
    if (formApplicableProductIds.includes(id)) {
      setFormApplicableProductIds(formApplicableProductIds.filter(pid => pid !== id));
    } else {
      setFormApplicableProductIds([...formApplicableProductIds, id]);
    }
  };

  const handleRemoveProductSelection = (id: string) => {
    setFormApplicableProductIds(formApplicableProductIds.filter(pid => pid !== id));
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formCode.trim()) {
      setFormError('Coupon code is required.');
      return;
    }

    if (formApplicability === 'single_item' && formApplicableProductIds.length === 0) {
      setFormError('Please select an eligible item for Single Selected Item mode.');
      return;
    }

    if (formApplicability === 'multiple_items' && formApplicableProductIds.length === 0) {
      setFormError('Please select at least one eligible item for Multiple Selected Items mode.');
      return;
    }

    if (formApplicability === 'category' && formApplicableCategorySlugs.length === 0) {
      setFormError('Please select at least one category for Selected Categories mode.');
      return;
    }

    // Validate Start vs Expiry
    if (formStartDate && formExpiresAt) {
      const startMs = new Date(`${formStartDate}T${formStartTime || '00:00'}`).getTime();
      const expiryMs = new Date(`${formExpiresAt}T${formExpiryTime || '23:59'}`).getTime();

      if (!isNaN(startMs) && !isNaN(expiryMs) && expiryMs <= startMs) {
        setFormError('Expiry date and time must be later than the start date and time.');
        return;
      }
    }

    const couponData: Coupon = {
      id: editingCoupon?.id || 'coup-' + Date.now(),
      code: formCode.trim().toUpperCase(),
      discountType: formDiscountType,
      discountValue: Number(formDiscountValue) || 0,
      minOrderAmount: formMinOrder ? Number(formMinOrder) : undefined,
      maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
      description: formDescription.trim(),
      startDate: formStartDate || undefined,
      startTime: formStartTime || undefined,
      expiresAt: formExpiresAt ? new Date(`${formExpiresAt}T${formExpiryTime || '23:59'}`).toISOString() : undefined,
      expiryTime: formExpiryTime || undefined,
      messageHeading: formMessageHeading.trim(),
      customerMessage: formCustomerMessage.trim(),
      expiredMessage: formExpiredMessage.trim(),
      invalidMessage: formInvalidMessage.trim(),
      notStartedMessage: formNotStartedMessage.trim(),
      successMessage: formSuccessMessage.trim(),
      applicability: formApplicability,
      applicableCategorySlugs: formApplicableCategorySlugs,
      applicableProductIds: formApplicableProductIds,
      isActive: formIsActive
    };

    await ottApi.saveCoupon(couponData);
    await ottApi.logAudit(editingCoupon ? 'UPDATE_COUPON' : 'CREATE_COUPON', 'coupons', couponData.id, { code: couponData.code });
    showToast(`Coupon "${couponData.code}" saved successfully! Enforced in checkout.`);
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
            <span>Coupon Rules & Applicability CMS</span>
          </h1>
          <p className="admin-sub-text">
            Configure discount caps, start & expiry windows, item/category applicability, and custom status messages.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh database"
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
              <th>Applicable To</th>
              <th>Validity Period</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-muted)' }}>
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
                        background: '#070d1e',
                        border: '1px solid #1e293b', 
                        padding: '4px 8px', 
                        borderRadius: '6px',
                        letterSpacing: '0.04em',
                        color: '#38bdf8'
                      }}>
                        {c.code}
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--admin-text-main)' }}>
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                    </strong>
                  </td>
                  <td>{c.minOrderAmount ? `₹${c.minOrderAmount}` : 'No Min'}</td>
                  <td>
                    <strong style={{ color: '#16a34a' }}>
                      {c.maxDiscount ? `₹${c.maxDiscount}` : 'Uncapped'}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.74rem', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 700 }}>
                      {c.applicability || 'all'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      {c.startDate ? `${c.startDate}` : 'Now'} → {c.expiresAt ? c.expiresAt.split('T')[0] : 'No Expiry'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c)}
                      className={`admin-badge ${c.isActive ? 'active' : 'inactive'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {c.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{c.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c)}
                        className="btn-primary-action"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="btn-refresh-action"
                        style={{ color: 'var(--admin-danger)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCoupon ? `Edit Coupon Rules: ${editingCoupon.code}` : 'Create New Coupon Promotion'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="admin-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formError && (
                  <div className="admin-alert-banner error">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Coupon Code & Generate */}
                <div className="admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Coupon Code *</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. FESTIVE70"
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                        required
                      />
                      <button type="button" onClick={handleGenerateCode} className="btn-refresh-action" title="Generate Code">
                        <Sparkles size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Discount Type</label>
                    <select
                      className="admin-form-select"
                      value={formDiscountType}
                      onChange={(e) => setFormDiscountType(e.target.value as any)}
                    >
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="fixed">Fixed Amount Discount (₹)</option>
                    </select>
                  </div>
                </div>

                {/* Discount Value, Min Order & Max Discount Cap */}
                <div className="admin-form-row-3">
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      {formDiscountType === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="admin-form-input"
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Min Cart Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-form-input"
                      placeholder="e.g. 299"
                      value={formMinOrder}
                      onChange={(e) => setFormMinOrder(e.target.value)}
                    />
                  </div>

                  {/* Requirement 8.A: Max Discount Cap */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min="1"
                      className="admin-form-input"
                      placeholder="e.g. 200 (For % coupons)"
                      value={formMaxDiscount}
                      onChange={(e) => setFormMaxDiscount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Requirement 8.B: Start & Expiry Window */}
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#38bdf8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    <span>Validity Window (Start & Expiry Date & Time)</span>
                  </h4>

                  <div className="admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Start Date & Time</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input type="date" className="admin-form-input" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
                        <input type="time" className="admin-form-input" value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)} />
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Expiry Date & Time</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input type="date" className="admin-form-input" value={formExpiresAt} onChange={(e) => setFormExpiresAt(e.target.value)} />
                        <input type="time" className="admin-form-input" value={formExpiryTime} onChange={(e) => setFormExpiryTime(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module 7.2 & 7.3: Coupon Applicability */}
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                  <label className="admin-form-label" style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '8px' }}>
                    Where Should This Coupon Apply?
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    {[
                      { key: 'all', label: 'All Eligible Items' },
                      { key: 'category', label: 'Selected Categories' },
                      { key: 'single_item', label: 'Single Selected Item' },
                      { key: 'multiple_items', label: 'Multiple Selected Items' }
                    ].map(mode => (
                      <button
                        type="button"
                        key={mode.key}
                        onClick={() => {
                          setFormApplicability(mode.key as any);
                          setItemSearchText('');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: formApplicability === mode.key ? 'rgba(56, 189, 248, 0.15)' : '#0b132b',
                          border: `1px solid ${formApplicability === mode.key ? '#38bdf8' : '#1e293b'}`,
                          borderRadius: '6px',
                          padding: '8px 10px',
                          color: formApplicability === mode.key ? '#ffffff' : '#cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {formApplicability === mode.key ? <CheckSquare size={13} color="#38bdf8" /> : <Square size={13} color="#64748b" />}
                        <span>{mode.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Mode A: Category Selection */}
                  {formApplicability === 'category' && (
                    <div>
                      <span style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                        Select one or more categories where this coupon is valid:
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {categories.map(cat => {
                          const isSelected = formApplicableCategorySlugs.includes(cat.slug);
                          return (
                            <button
                              type="button"
                              key={cat.slug}
                              onClick={() => handleToggleCategorySelection(cat.slug)}
                              style={{
                                background: isSelected ? '#0284c7' : '#0b132b',
                                color: '#fff',
                                border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {isSelected ? <Check size={12} /> : null}
                              <span>{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mode B & C: Single Item or Multiple Items Selector */}
                  {(formApplicability === 'single_item' || formApplicability === 'multiple_items') && (
                    <div>
                      {/* Search Bar for Items */}
                      <div style={{ marginBottom: '8px' }}>
                        <input
                          type="text"
                          className="admin-form-input"
                          placeholder={formApplicability === 'single_item' ? "Search items to select exactly one item..." : "Search items to add to eligible list..."}
                          value={itemSearchText}
                          onChange={(e) => setItemSearchText(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        />
                      </div>

                      {/* Selected Items Pills (for Multiple Items mode) */}
                      {formApplicability === 'multiple_items' && formApplicableProductIds.length > 0 && (
                        <div style={{ marginBottom: '10px', padding: '8px', background: '#0b132b', borderRadius: '8px', border: '1px solid #1e293b' }}>
                          <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                            Selected Eligible Items ({formApplicableProductIds.length}):
                          </span>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {formApplicableProductIds.map(pid => {
                              const p = products.find(prod => prod.id === pid);
                              return (
                                <span
                                  key={pid}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: '#0284c7',
                                    color: '#ffffff',
                                    fontSize: '0.74rem',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 600
                                  }}
                                >
                                  <span>{p?.name || pid}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProductSelection(pid)}
                                    style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0 }}
                                    title="Remove item"
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Searchable Items Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                        {products
                          .filter(p => !itemSearchText || p.name.toLowerCase().includes(itemSearchText.toLowerCase()) || p.categoryName?.toLowerCase().includes(itemSearchText.toLowerCase()))
                          .map(prod => {
                            const isSelected = formApplicableProductIds.includes(prod.id);
                            return (
                              <button
                                type="button"
                                key={prod.id}
                                onClick={() => handleToggleProductSelection(prod.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  background: isSelected ? 'rgba(56, 189, 248, 0.2)' : '#0b132b',
                                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  color: '#fff',
                                  fontSize: '0.76rem',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                {isSelected ? <CheckSquare size={13} color="#38bdf8" /> : <Square size={13} color="#64748b" />}
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <strong style={{ display: 'block', fontSize: '0.76rem', color: isSelected ? '#38bdf8' : '#f8fafc' }}>{prod.name}</strong>
                                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>₹{prod.price || prod.plans?.[0]?.price} • {prod.categoryName}</span>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Module 7.4: Custom Customer Message & Heading */}
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={14} />
                    <span>Customer Facing Heading & Custom Messages</span>
                  </h4>

                  <div className="admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Customer Message Heading</label>
                      <input type="text" className="admin-form-input" placeholder="e.g. Special Discount Deal" value={formMessageHeading} onChange={(e) => setFormMessageHeading(e.target.value)} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Custom Customer Message</label>
                      <input type="text" className="admin-form-input" placeholder="e.g. Get instant discount on your order!" value={formCustomerMessage} onChange={(e) => setFormCustomerMessage(e.target.value)} />
                    </div>
                  </div>

                  <div className="admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Expired Coupon Message</label>
                      <input type="text" className="admin-form-input" value={formExpiredMessage} onChange={(e) => setFormExpiredMessage(e.target.value)} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Invalid Coupon Message</label>
                      <input type="text" className="admin-form-input" value={formInvalidMessage} onChange={(e) => setFormInvalidMessage(e.target.value)} />
                    </div>
                  </div>

                  <div className="admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Not Started Message</label>
                      <input type="text" className="admin-form-input" value={formNotStartedMessage} onChange={(e) => setFormNotStartedMessage(e.target.value)} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '0.74rem' }}>Success Application Message</label>
                      <input type="text" className="admin-form-input" value={formSuccessMessage} onChange={(e) => setFormSuccessMessage(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Publication Status</label>
                  <select className="admin-form-select" value={formIsActive ? 'active' : 'inactive'} onChange={(e) => setFormIsActive(e.target.value === 'active')}>
                    <option value="active">Active (ON - Can be used in checkout)</option>
                    <option value="inactive">Inactive (OFF - Disabled)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-refresh-action">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action">
                  <Check size={16} />
                  <span>{editingCoupon ? 'Save Coupon Rules' : 'Create Coupon'}</span>
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
