import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  Image as ImageIcon, RefreshCw, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { Product, Category } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategorySlug, setFormCategorySlug] = useState('');
  const [formPrice, setFormPrice] = useState('199');
  const [formOriginalPrice, setFormOriginalPrice] = useState('499');
  const [formTagline, setFormTagline] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formInStock, setFormInStock] = useState(true);
  const [formStatus, setFormStatus] = useState<'ON' | 'OFF'>('ON');
  const [formFeatures, setFormFeatures] = useState('');

  // Uploading state
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
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormCategorySlug(categories[0]?.slug || 'movies-series');
    setFormPrice('199');
    setFormOriginalPrice('499');
    setFormTagline('');
    setFormImageUrl('');
    setFormInStock(true);
    setFormStatus('ON');
    setFormFeatures('Private Screen with 4-Digit PIN\n4K Ultra HD Dolby Atmos\n100% Genuine with Warranty');
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
    setFormInStock(p.inStock);
    setFormStatus(p.status || 'ON');
    setFormFeatures((p.features || []).join('\n'));
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const res = await uploadService.uploadImage(file, 'products');
    setIsUploading(false);

    if (res.success && res.url) {
      setFormImageUrl(res.url);
    } else {
      setUploadError(res.error || 'Image upload failed.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formImageUrl) {
      setUploadError('Please provide product name and image.');
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
      name: formName,
      slug: generatedSlug,
      tagline: formTagline,
      categorySlug: formCategorySlug,
      categoryName: cat?.name || 'OTT Subscriptions',
      subcategorySlug: editingProduct?.subcategorySlug || 'ott',
      subcategoryName: editingProduct?.subcategoryName || 'Streaming',
      catalogSlugs: editingProduct?.catalogSlugs || [],
      image: formImageUrl,
      brandColor: editingProduct?.brandColor || '#0b132b',
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
        }
      ],
      price: priceNum,
      comparePrice: origPriceNum,
      features: featuresList,
      deliverables: editingProduct?.deliverables || ['Instant WhatsApp Activation Token'],
      rules: editingProduct?.rules || ['Do not share credentials'],
      faqs: editingProduct?.faqs || [],
      status: formStatus,
      inStock: formInStock,
      warrantyPeriod: 'Full Duration Replacement Warranty',
      updatedAt: Date.now()
    };

    await ottApi.saveProduct(updatedProduct);
    await ottApi.logAudit(editingProduct ? 'Product Edited' : 'Product Created', 'Products', updatedProduct.id);

    setSaveSuccessMsg(`Product "${updatedProduct.name}" saved to Supabase database!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"? This action cannot be undone.`)) {
      await ottApi.deleteProduct(id);
      await ottApi.logAudit('Product Deleted', 'Products', id);
      loadData();
    }
  };

  const handleToggleStatus = async (p: Product) => {
    const newStatus: 'ON' | 'OFF' = p.status === 'ON' ? 'OFF' : 'ON';
    const updated: Product = { ...p, status: newStatus, updatedAt: Date.now() };
    await ottApi.saveProduct(updated);
    loadData();
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.categorySlug === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="admin-products-page">
      <div className="admin-page-header">
        <div className="admin-page-title-block">
          <h1>Product Management</h1>
          <p>Authoritative catalog products, 4K subscriptions, pricing plans & stock.</p>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            onClick={loadData} 
            className="btn-admin-secondary"
            title="Refresh database"
          >
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            type="button" 
            onClick={handleOpenAddModal} 
            className="btn-admin-primary"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-auth-alert" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', color: '#34d399' }}>
          <Check size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="admin-input-wrap" style={{ flex: '1', minWidth: '240px' }}>
          <Search size={18} className="field-icon" />
          <input
            type="text"
            placeholder="Search products by title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            background: '#070d1e',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            fontSize: '0.88rem'
          }}
        >
          <option value="all">All Categories ({categories.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Original</th>
              <th>Stock</th>
              <th>Live Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                  Loading database records...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                  No matching products found in database.
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => {
                const img = getCleanImageUrl(p.image, p.updatedAt);
                const currentPrice = p.plans?.[0]?.price || p.price;
                const origPrice = p.plans?.[0]?.originalPrice || p.comparePrice;

                return (
                  <tr key={p.id}>
                    <td>
                      <img 
                        src={img} 
                        alt={p.name} 
                        style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px', backgroundColor: p.brandColor }} 
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: '#ffffff' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>slug: /{p.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#38bdf8' }}>
                        {p.categoryName}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#10b981' }}>₹ {currentPrice}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#94a3b8', textDecoration: 'line-through' }}>₹ {origPrice}</span>
                    </td>
                    <td>
                      {p.inStock ? (
                        <span className="status-badge active">In Stock</span>
                      ) : (
                        <span className="status-badge inactive">Out of Stock</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p)}
                        className={`status-badge ${p.status === 'ON' ? 'active' : 'inactive'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle live display on customer storefront"
                      >
                        {p.status === 'ON' ? 'Live (ON)' : 'Hidden (OFF)'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit Product Details & Price"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn delete"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>{editingProduct ? 'Edit Product Details' : 'Add New Product'}</h2>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {uploadError && (
              <div className="admin-auth-alert error" style={{ marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="admin-form-grid">
              <div className="admin-form-group admin-form-full">
                <label>Product Title *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Netflix Premium 4K UHD Private Profile"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>URL Slug (auto-generated if empty)</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. netflix-premium-4k"
                />
              </div>

              <div className="admin-form-group">
                <label>Category *</label>
                <select
                  value={formCategorySlug}
                  onChange={(e) => setFormCategorySlug(e.target.value)}
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Selling Price (₹) *</label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="199"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Original / Strikethrough Price (₹)</label>
                <input
                  type="number"
                  value={formOriginalPrice}
                  onChange={(e) => setFormOriginalPrice(e.target.value)}
                  placeholder="649"
                />
              </div>

              {/* Image Upload Row */}
              <div className="admin-form-group admin-form-full">
                <label>Product Image (Upload to Cloudinary / Supabase or Enter URL) *</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://... image URL"
                    style={{ flex: 1 }}
                    required
                  />
                  <label 
                    className="btn-admin-secondary" 
                    style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={16} />
                    <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {formImageUrl && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={formImageUrl} 
                      alt="Preview" 
                      style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }} 
                    />
                    <span style={{ fontSize: '0.78rem', color: '#10b981' }}>✓ Image Ready</span>
                  </div>
                )}
              </div>

              <div className="admin-form-group admin-form-full">
                <label>Tagline / Sub-heading</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. Private 4K Ultra HD Profile with 4-Digit PIN Lock & Zero Buffering"
                />
              </div>

              <div className="admin-form-group admin-form-full">
                <label>Key Features (One feature per line)</label>
                <textarea
                  rows={4}
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  placeholder="Private Screen with 4-Digit Security PIN&#10;Dolby Atmos & 4K UHD Video Quality&#10;Works on Smart TV, PC & Mobile"
                />
              </div>

              <div className="admin-form-group">
                <label>Live Visibility</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'ON' | 'OFF')}
                >
                  <option value="ON">ON (Visible on Storefront)</option>
                  <option value="OFF">OFF (Hidden Draft)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Inventory Stock State</label>
                <select
                  value={formInStock ? 'true' : 'false'}
                  onChange={(e) => setFormInStock(e.target.value === 'true')}
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              <div className="admin-modal-actions admin-form-full">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-admin-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={isUploading}
                >
                  Save to Supabase Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
