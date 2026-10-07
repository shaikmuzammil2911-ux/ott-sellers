import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  Image as ImageIcon, RefreshCw, AlertCircle, Eye, EyeOff, 
  Package, Crop, Star, Sparkles, Tag, DollarSign 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { Product, Category } from '../../types';
import { ImageCropperModal } from '../../components/admin/ImageCropperModal';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => ottApi.getCachedProductsAdmin());
  const [categories, setCategories] = useState<Category[]>(() => ottApi.getCachedCategoriesAdmin());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Drawer / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategorySlug, setFormCategorySlug] = useState('');
  const [formPrice, setFormPrice] = useState('199');
  const [formOriginalPrice, setFormOriginalPrice] = useState('499');
  const [formTagline, setFormTagline] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formInStock, setFormInStock] = useState(true);
  const [formInOffers, setFormInOffers] = useState(false);
  const [formOfferPrice, setFormOfferPrice] = useState('');
  const [formStatus, setFormStatus] = useState<'ON' | 'OFF'>('ON');
  const [formFeatures, setFormFeatures] = useState('');

  // Cropper State
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        ottApi.getAllProductsAdmin(),
        ottApi.getAllCategoriesAdmin()
      ]);
      setProducts(prods);
      setCategories(cats);
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

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormCategorySlug(categories[0]?.slug || 'movies-series');
    setFormPrice('199');
    setFormOriginalPrice('499');
    setFormTagline('Instant WhatsApp Credentials Delivery');
    setFormImageUrl('');
    setFormDisplayOrder(String(products.length + 1));
    setFormInStock(true);
    setFormInOffers(false);
    setFormOfferPrice('');
    setFormStatus('ON');
    setFormFeatures('Private Screen with 4-Digit PIN\n4K Ultra HD Streaming\nFull Replacement Warranty');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormCategorySlug(p.categorySlug);
    setFormPrice(String(p.plans?.[0]?.price || p.price || 199));
    setFormOriginalPrice(String(p.plans?.[0]?.originalPrice || p.comparePrice || 499));
    setFormTagline(p.tagline || '');
    setFormImageUrl(p.image);
    setFormDisplayOrder(String(p.displayOrder || 1));
    setFormInStock(p.inStock);
    setFormInOffers(p.inOffers ?? false);
    setFormOfferPrice(p.offerPrice ? String(p.offerPrice) : '');
    setFormStatus(p.status || 'ON');
    setFormFeatures((p.features || []).join('\n'));
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setRawImageSrc(reader.result as string);
        setIsCropOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob, croppedDataUrl: string) => {
    setIsCropOpen(false);
    setIsUploading(true);
    setUploadError(null);

    // Create file from blob
    const croppedFile = new File([croppedBlob], `product-${Date.now()}.webp`, { type: 'image/webp' });
    const res = await uploadService.uploadImage(croppedFile, 'products');
    setIsUploading(false);

    if (res.success && res.url) {
      setFormImageUrl(res.url);
      showToast('Cropped 1:1 image uploaded and ready to save!');
    } else {
      // Fallback to data URL
      setFormImageUrl(croppedDataUrl);
      showToast('Cropped preview ready.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formImageUrl.trim()) {
      setUploadError('Product name and square product image are required.');
      return;
    }

    const priceNum = Number(formPrice) || 0;
    const origPriceNum = Number(formOriginalPrice) || priceNum;
    const discountPct = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;
    const cat = categories.find(c => c.slug === formCategorySlug);
    const featuresList = formFeatures.split('\n').map(f => f.trim()).filter(Boolean);

    const generatedSlug = formSlug.trim() 
      ? formSlug.trim().toLowerCase().replace(/\s+/g, '-')
      : formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const updatedProduct: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: formName.trim(),
      slug: generatedSlug,
      tagline: formTagline.trim(),
      categorySlug: formCategorySlug,
      categoryName: cat?.name || 'OTT Subscriptions',
      subcategorySlug: editingProduct?.subcategorySlug || 'ott',
      subcategoryName: editingProduct?.subcategoryName || 'Streaming',
      catalogSlugs: editingProduct?.catalogSlugs || [],
      image: formImageUrl.trim(),
      brandColor: editingProduct?.brandColor || '#0b132b',
      brandLogoText: editingProduct?.brandLogoText || formName.split(' ')[0],
      rating: editingProduct?.rating || 4.9,
      reviewsCount: editingProduct?.reviewsCount || 120,
      defaultPlan: '1 Month',
      plans: [
        {
          duration: '1 Month',
          price: priceNum,
          originalPrice: origPriceNum,
          discountPercentage: discountPct,
          isPopular: true
        },
        {
          duration: '3 Months',
          price: priceNum * 3 - Math.round(priceNum * 0.1),
          originalPrice: origPriceNum * 3,
          discountPercentage: discountPct + 5
        },
        {
          duration: '12 Months',
          price: priceNum * 10,
          originalPrice: origPriceNum * 12,
          discountPercentage: discountPct + 15
        }
      ],
      price: priceNum,
      comparePrice: origPriceNum,
      features: featuresList,
      deliverables: editingProduct?.deliverables || ['Instant WhatsApp Activation Token', '4-Digit PIN Lock'],
      rules: editingProduct?.rules || ['Do not share credentials with multiple users'],
      faqs: editingProduct?.faqs || [
        { question: 'How quickly will I receive my subscription?', answer: 'Credentials are dispatched in 5-15 minutes on WhatsApp.' }
      ],
      displayOrder: Number(formDisplayOrder) || 1,
      inOffers: formInOffers,
      offerPrice: formOfferPrice ? Number(formOfferPrice) : undefined,
      offerOriginalPrice: formOfferPrice ? origPriceNum : undefined,
      offerDiscountPercentage: formOfferPrice && origPriceNum > Number(formOfferPrice)
        ? Math.round(((origPriceNum - Number(formOfferPrice)) / origPriceNum) * 100)
        : undefined,
      status: formStatus,
      inStock: formInStock,
      warrantyPeriod: 'Full Duration Replacement Warranty',
      badge: discountPct >= 20 ? `${discountPct}% OFF` : undefined,
      updatedAt: Date.now()
    };

    await ottApi.saveProduct(updatedProduct);
    await ottApi.logAudit(editingProduct ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT', 'products', updatedProduct.id, {
      name: updatedProduct.name,
      price: updatedProduct.price
    });

    showToast(`Product "${updatedProduct.name}" saved! Live website updated.`);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"?`)) {
      await ottApi.deleteProduct(id);
      await ottApi.logAudit('DELETE_PRODUCT', 'products', id, { name });
      showToast(`Product "${name}" deleted.`);
      await loadData();
    }
  };

  const handleToggleStatus = async (p: Product) => {
    const newStatus = p.status === 'ON' ? 'OFF' : 'ON';
    const updated: Product = { ...p, status: newStatus, updatedAt: Date.now() };
    await ottApi.saveProduct(updated);
    showToast(`Product is now ${newStatus === 'ON' ? 'Active' : 'Inactive'}.`);
    await loadData();
  };

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (categoryFilter !== 'all' && p.categorySlug !== categoryFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Package className="admin-heading-icon" style={{ color: '#38bdf8' }} />
            <span>Items & Subscriptions Catalog</span>
          </h1>
          <p className="admin-sub-text">
            Manage OTT plans, prices, square 1:1 image cropping, stock status, and special offers.
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
            <span>Add New Item</span>
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
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id || c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Statuses</option>
            <option value="ON">Active</option>
            <option value="OFF">Inactive</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {filteredProducts.map((p) => {
          const defaultPlan = p.plans?.[0] || { price: p.price || 199, originalPrice: p.comparePrice || 499 };
          const imgUrl = getCleanImageUrl(p.image, p.updatedAt);

          return (
            <div
              key={p.id}
              style={{
                background: '#070d1e',
                border: `1px solid ${p.status === 'ON' ? '#1e293b' : '#334155'}`,
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                opacity: p.status === 'ON' ? 1 : 0.65
              }}
            >
              {/* Square Image Preview */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: p.brandColor || '#0b132b', overflow: 'hidden' }}>
                <img
                  src={imgUrl}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(7,13,30,0.85) 100%)' }} />

                <span style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: p.status === 'ON' ? '#10b981' : '#64748b',
                  color: '#ffffff'
                }}>
                  {p.status === 'ON' ? 'Active' : 'Inactive'}
                </span>

                {p.inOffers && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: '#e50914',
                    color: '#ffffff'
                  }}>
                    Special Offer
                  </span>
                )}

                <div style={{ position: 'absolute', bottom: '8px', left: '10px', right: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
                    {p.categoryName}
                  </span>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </h3>
                </div>
              </div>

              {/* Card Footer / Pricing & Actions */}
              <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      ₹ {p.inOffers && p.offerPrice ? p.offerPrice : defaultPlan.price}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', textDecoration: 'line-through' }}>
                      ₹ {defaultPlan.originalPrice}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Order #{p.displayOrder || 1}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(p)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #1e293b',
                      color: p.status === 'ON' ? '#e2e8f0' : '#94a3b8',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    {p.status === 'ON' ? 'Deactivate' : 'Activate'}
                  </button>

                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(p)}
                      style={{
                        background: 'rgba(2, 132, 199, 0.15)',
                        border: '1px solid rgba(2, 132, 199, 0.3)',
                        color: '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#f87171',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8', background: '#070d1e', borderRadius: '12px', border: '1px dashed #1e293b' }}>
          <Package size={32} style={{ opacity: 0.5, marginBottom: '6px' }} />
          <p>No products match the filter criteria.</p>
        </div>
      )}

      {/* Compact Side Drawer / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box compact" style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingProduct ? 'Edit Item / Product' : 'Add New Item / Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-body" style={{ gap: '12px' }}>
              {uploadError && (
                <div className="admin-auth-alert error">
                  <AlertCircle size={16} />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* 1. Basic Info */}
              <div className="form-group-compact">
                <label>Item Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Netflix Premium 4K UHD"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group-compact">
                  <label>Category *</label>
                  <select
                    value={formCategorySlug}
                    onChange={(e) => setFormCategorySlug(e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c.id || c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-compact">
                  <label>URL Slug</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="auto-generated from name"
                  />
                </div>
              </div>

              {/* 2. Pricing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group-compact">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>

                <div className="form-group-compact">
                  <label>Original / MRP (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* 3. Special Offer Toggle */}
              <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>
                    Include in Special Offers Page
                  </span>
                  <input
                    type="checkbox"
                    checked={formInOffers}
                    onChange={(e) => setFormInOffers(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#e50914' }}
                  />
                </div>
                {formInOffers && (
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '0.74rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                      Special Offer Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formOfferPrice}
                      onChange={(e) => setFormOfferPrice(e.target.value)}
                      placeholder="e.g. 149"
                      style={{ width: '100%', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '8px', padding: '8px 12px', color: '#34d399', fontSize: '0.84rem' }}
                    />
                  </div>
                )}
              </div>

              {/* 4. Square Image & Crop Feature */}
              <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>
                    Square 1:1 Product Image *
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Crop to fit square cards
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {formImageUrl ? (
                    <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b', flexShrink: 0 }}>
                      <img src={formImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#0b132b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #334155', flexShrink: 0 }}>
                      <ImageIcon size={20} color="#64748b" />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      <Crop size={14} />
                      <span>{isUploading ? 'Uploading...' : 'Upload & Crop Image (1:1)'}</span>
                      <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste direct image URL..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      style={{ background: '#0b132b', border: '1px solid #1e293b', borderRadius: '6px', padding: '6px 10px', fontSize: '0.76rem', color: '#cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* 5. Tagline & Features */}
              <div className="form-group-compact">
                <label>Short Tagline</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. Ultra HD 4K Streaming with Private PIN"
                />
              </div>

              <div className="form-group-compact">
                <label>Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  placeholder="Private 4-Digit PIN Lock&#10;4K Ultra HD Dolby Atmos&#10;Full Duration Warranty"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group-compact">
                  <label>Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                  />
                </div>

                <div className="form-group-compact">
                  <label>Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'ON' | 'OFF')}
                  >
                    <option value="ON">Active (Visible)</option>
                    <option value="OFF">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                  Save Item to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropOpen}
        imageSrc={rawImageSrc}
        aspectRatio={1} // 1:1 Square Card Ratio
        title="Crop Item Image (1:1 Square Ratio)"
        onCropComplete={handleCropComplete}
        onCancel={() => setIsCropOpen(false)}
      />
    </div>
  );
};
