import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  Image as ImageIcon, RefreshCw, AlertCircle, Eye, EyeOff, 
  Package, Crop, Star, Sparkles, Tag, DollarSign, Info, Layers, CheckSquare, Square
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

  // Form Fields - Group 1: Basic Information
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategorySlug, setFormCategorySlug] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Form Fields - Group 2: Pricing
  const [formPrice, setFormPrice] = useState('199');
  const [formOriginalPrice, setFormOriginalPrice] = useState('499');
  const [formOfferPrice, setFormOfferPrice] = useState('');
  const [formInOffers, setFormInOffers] = useState(false);

  // Form Fields - Group 3: Images & Media
  const [formImageUrl, setFormImageUrl] = useState('');

  // Form Fields - Group 4: Display & Publication
  const [formStatus, setFormStatus] = useState<'ON' | 'OFF'>('ON');
  const [formInStock, setFormInStock] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');

  // Form Fields - Group 5: Preserved Business Fields
  const [formFeatures, setFormFeatures] = useState('');
  const [formWarranty, setFormWarranty] = useState('Full Duration Replacement Warranty');

  // Validation Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    setFormTagline('Instant WhatsApp Credentials Delivery');
    setFormCategorySlug(categories[0]?.slug || 'movies-series');
    setFormDescription('Verified 4K streaming access with instant PIN activation.');
    setFormPrice('199');
    setFormOriginalPrice('499');
    setFormOfferPrice('');
    setFormInOffers(false);
    setFormImageUrl('');
    setFormStatus('ON');
    setFormInStock(true);
    setFormIsFeatured(false);
    setFormIsTrending(false);
    setFormDisplayOrder(String(products.length + 1));
    setFormFeatures('Private Screen with 4-Digit PIN\n4K Ultra HD Streaming\nFull Duration Replacement Warranty');
    setFormWarranty('Full Duration Replacement Warranty');
    setFieldErrors({});
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormTagline(p.tagline || '');
    setFormCategorySlug(p.categorySlug);
    setFormDescription(p.tagline || '');
    setFormPrice(String(p.plans?.[0]?.price || p.price || 199));
    setFormOriginalPrice(String(p.plans?.[0]?.originalPrice || p.comparePrice || 499));
    setFormOfferPrice(p.offerPrice ? String(p.offerPrice) : '');
    setFormInOffers(p.inOffers ?? false);
    setFormImageUrl(p.image);
    setFormStatus(p.status || 'ON');
    setFormInStock(p.inStock);
    setFormIsFeatured(p.isFeatured ?? false);
    setFormIsTrending(p.isTrending ?? false);
    setFormDisplayOrder(String(p.displayOrder || 1));
    setFormFeatures((p.features || []).join('\n'));
    setFormWarranty(p.warrantyPeriod || 'Full Duration Replacement Warranty');
    setFieldErrors({});
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

    const croppedFile = new File([croppedBlob], `product-${Date.now()}.webp`, { type: 'image/webp' });
    const res = await uploadService.uploadImage(croppedFile, 'products');
    setIsUploading(false);

    if (res.success && res.url) {
      setFormImageUrl(res.url);
      showToast('Square product image uploaded successfully!');
    } else {
      setFormImageUrl(croppedDataUrl);
      showToast('Cropped preview ready.');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.formName = 'Item name is required.';
    if (!formCategorySlug) errors.formCategorySlug = 'Please select a category.';
    if (!formPrice || Number(formPrice) <= 0) errors.formPrice = 'Please enter a valid price.';
    if (!formImageUrl.trim()) errors.formImageUrl = 'Product image is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

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
      isFeatured: formIsFeatured,
      isTrending: formIsTrending,
      warrantyPeriod: formWarranty.trim() || 'Full Duration Replacement Warranty',
      badge: discountPct >= 20 ? `${discountPct}% OFF` : undefined,
      updatedAt: Date.now()
    };

    await ottApi.saveProduct(updatedProduct);
    await ottApi.logAudit(editingProduct ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT', 'products', updatedProduct.id, {
      name: updatedProduct.name,
      price: updatedProduct.price
    });

    showToast(`Product "${updatedProduct.name}" saved & live on storefront!`);
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
    showToast(`Product "${p.name}" is now ${newStatus === 'ON' ? 'Active' : 'Inactive'}.`);
    await loadData();
  };

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || (p.tagline || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (categoryFilter !== 'all' && p.categorySlug !== categoryFilter) return false;
    if (statusFilter === 'ON' && p.status !== 'ON') return false;
    if (statusFilter === 'OFF' && p.status !== 'OFF') return false;
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Package className="admin-heading-icon" style={{ color: '#0284c7' }} />
            <span>Items & Subscription Products</span>
          </h1>
          <p className="admin-sub-text">
            Add new streaming subscriptions, set pricing, upload 1:1 product artwork, and manage website display options.
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
            placeholder="Search items by name or tagline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="all">All Statuses</option>
            <option value="ON">Active Only</option>
            <option value="OFF">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Stock</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-muted)' }}>
                  No items found. Click <strong>+ Add New Item</strong> to create one.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={getCleanImageUrl(p.image, p.updatedAt)}
                      alt={p.name}
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #1e293b' }}
                    />
                  </td>
                  <td>
                    <strong style={{ color: 'var(--admin-text-main)', fontSize: '0.9rem', display: 'block' }}>{p.name}</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>{p.tagline}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {p.categoryName}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#16a34a' }}>₹{p.price || p.plans?.[0]?.price}</strong>
                    {p.comparePrice && <span style={{ textDecoration: 'line-through', fontSize: '0.74rem', color: '#94a3b8', marginLeft: '4px' }}>₹{p.comparePrice}</span>}
                  </td>
                  <td>
                    <button type="button" onClick={() => handleToggleStatus(p)} className={`admin-badge ${p.status === 'ON' ? 'active' : 'inactive'}`} style={{ cursor: 'pointer', border: 'none' }}>
                      {p.status === 'ON' ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{p.status === 'ON' ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: p.inStock ? '#16a34a' : '#ef4444' }}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => handleOpenEditModal(p)} className="btn-primary-action" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteProduct(p.id, p.name)} className="btn-refresh-action" style={{ color: 'var(--admin-danger)' }}>
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

      {/* SIMPLIFIED LOGICALLY GROUPED ADDING / EDITING FORM MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingProduct ? `Edit Item: ${editingProduct.name}` : 'Add New Item / Subscription'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="admin-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {uploadError && (
                  <div className="admin-alert-banner error">
                    <AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* GROUP 1: BASIC INFORMATION */}
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={16} />
                    <span>1. Basic Information</span>
                  </h3>

                  <div className="admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Item Name *</label>
                      <input type="text" className="admin-form-input" placeholder="e.g. Netflix Premium 4K UHD" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                      {fieldErrors.formName && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{fieldErrors.formName}</span>}
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Primary Category *</label>
                      <select className="admin-form-select" value={formCategorySlug} onChange={(e) => setFormCategorySlug(e.target.value)} required>
                        {categories.map(c => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                      {fieldErrors.formCategorySlug && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{fieldErrors.formCategorySlug}</span>}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Short Description / Tagline</label>
                    <input type="text" className="admin-form-input" placeholder="e.g. Stream 4K Ultra HD on 1 Screen with Private PIN" value={formTagline} onChange={(e) => setFormTagline(e.target.value)} />
                  </div>
                </div>

                {/* GROUP 2: PRICING & DISCOUNTS */}
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#16a34a', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} />
                    <span>2. Pricing & Offer Deals</span>
                  </h3>

                  <div className="admin-form-row-3">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Selling Price (₹) *</label>
                      <input type="number" min="0" className="admin-form-input" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required />
                      {fieldErrors.formPrice && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{fieldErrors.formPrice}</span>}
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Original / MRP Price (₹)</label>
                      <input type="number" min="0" className="admin-form-input" value={formOriginalPrice} onChange={(e) => setFormOriginalPrice(e.target.value)} />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Special Offer Deal Price (₹)</label>
                      <input type="number" min="0" className="admin-form-input" placeholder="Optional offer price" value={formOfferPrice} onChange={(e) => setFormOfferPrice(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.82rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formInOffers} onChange={(e) => setFormInOffers(e.target.checked)} />
                      <span>Feature in Special Deals & Limited Offers Section</span>
                    </label>
                  </div>
                </div>

                {/* GROUP 3: IMAGES & 1:1 CROPPER */}
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} />
                    <span>3. Product Artwork Image (Square 1:1 Ratio)</span>
                  </h3>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {formImageUrl && (
                      <div style={{ position: 'relative' }}>
                        <img src={getCleanImageUrl(formImageUrl)} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #38bdf8' }} />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <input type="text" className="admin-form-input" placeholder="Image URL (or upload image below)" value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} required />
                      {fieldErrors.formImageUrl && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{fieldErrors.formImageUrl}</span>}

                      <div style={{ marginTop: '8px' }}>
                        <input type="file" id="product-square-file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
                        <label htmlFor="product-square-file" className="btn-refresh-action" style={{ cursor: 'pointer', display: 'inline-flex', gap: '6px', fontSize: '0.78rem', padding: '6px 12px' }}>
                          <Crop size={14} />
                          <span>{isUploading ? 'Uploading...' : 'Select & Crop Image (1:1)'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GROUP 4: DISPLAY & PUBLICATION */}
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#c084fc', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={16} />
                    <span>4. Display & Publication Settings</span>
                  </h3>

                  <div className="admin-form-row-3">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Publication Status</label>
                      <select className="admin-form-select" value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
                        <option value="ON">Active (ON - Live on website)</option>
                        <option value="OFF">Inactive (OFF - Hidden)</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Stock Status</label>
                      <select className="admin-form-select" value={formInStock ? 'yes' : 'no'} onChange={(e) => setFormInStock(e.target.value === 'yes')}>
                        <option value="yes">In Stock (Available)</option>
                        <option value="no">Out of Stock (Sold Out)</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Display Order</label>
                      <input type="number" min="1" className="admin-form-input" value={formDisplayOrder} onChange={(e) => setFormDisplayOrder(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.82rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formIsFeatured} onChange={(e) => setFormIsFeatured(e.target.checked)} />
                      <span>Featured Subscriptions Badge</span>
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.82rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formIsTrending} onChange={(e) => setFormIsTrending(e.target.checked)} />
                      <span>Trending Badge</span>
                    </label>
                  </div>
                </div>

                {/* GROUP 5: FEATURES & WARRANTY (PRESERVED FIELDS) */}
                <div style={{ background: '#070d1e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fb7185', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} />
                    <span>5. Product Deliverables & Warranty</span>
                  </h3>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Key Features (One feature per line)</label>
                    <textarea rows={3} className="admin-form-input" value={formFeatures} onChange={(e) => setFormFeatures(e.target.value)} />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Warranty Guarantee Period</label>
                    <input type="text" className="admin-form-input" value={formWarranty} onChange={(e) => setFormWarranty(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="admin-modal-footer" style={{ borderTop: '1px solid #1e293b', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-refresh-action">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action" style={{ padding: '8px 24px' }}>
                  <Check size={16} />
                  <span>{editingProduct ? 'Save Changes' : 'Save Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {isCropOpen && (
        <ImageCropperModal
          isOpen={isCropOpen}
          imageSrc={rawImageSrc}
          onCancel={() => setIsCropOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default AdminProductsPage;
