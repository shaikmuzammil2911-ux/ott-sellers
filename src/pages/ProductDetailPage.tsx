import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, ShoppingCart, Zap, MessageCircle, ShieldCheck, Check, 
  HelpCircle, ChevronDown, ChevronUp, Clock, AlertTriangle, ArrowRight, X 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../services/api';
import { Product, PlanDuration, ProductPlan } from '../types';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/common/ProductCard';
import './ProductDetailPage.css';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>('1 Month');
  const [whatsAppSettings, setWhatsAppSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadProduct = async () => {
    if (!slug) return;
    setLoading(true);
    setHasError(false);
    try {
      const [prod, ws] = await Promise.all([
        ottApi.getProductBySlug(slug),
        ottApi.getWhatsAppSettings().catch(() => null)
      ]);
      if (prod) {
        setProduct(prod);
        setSelectedDuration(prod.defaultPlan || (prod.plans && prod.plans[0]?.duration) || '1 Month');
        if (prod.categorySlug) {
          try {
            const related = await ottApi.getProductsByCategory(prod.categorySlug);
            setRelatedProducts((related || []).filter(r => r.id !== prod.id).slice(0, 5));
          } catch {
            setRelatedProducts([]);
          }
        }
      } else {
        setProduct(null);
      }
      if (ws) {
        setWhatsAppSettings(ws);
      }
    } catch (err) {
      console.error('Error loading product details:', err);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container" style={{ padding: '36px 16px' }}>
          <div className="product-main-grid" style={{ opacity: 0.7 }}>
            <div className="product-media-column">
              <div 
                style={{ 
                  aspectRatio: '1 / 1', 
                  borderRadius: '16px', 
                  background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'prodSkeletonShimmer 1.5s infinite'
                }} 
              />
            </div>
            <div className="product-info-column" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ height: '32px', width: '70%', background: '#e2e8f0', borderRadius: '8px' }} />
              <div style={{ height: '20px', width: '40%', background: '#e2e8f0', borderRadius: '6px' }} />
              <div style={{ height: '48px', width: '50%', background: '#e2e8f0', borderRadius: '8px' }} />
              <div style={{ height: '44px', width: '100%', background: '#e2e8f0', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <AlertTriangle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Unable to Load Subscription
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          A network or data error occurred while fetching details for this subscription.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            type="button" 
            onClick={loadProduct}
            className="btn-primary" 
            style={{ padding: '10px 20px', borderRadius: '8px' }}
          >
            Retry Loading
          </button>
          <Link 
            to="/items" 
            className="btn-secondary" 
            style={{ padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', background: '#f1f5f9', color: '#0f172a' }}
          >
            Browse All Subscriptions
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Subscription Not Found
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          The subscription you are looking for does not exist or may have been updated.
        </p>
        <Link 
          to="/items" 
          className="btn-primary" 
          style={{ padding: '10px 20px', borderRadius: '8px', display: 'inline-block', textDecoration: 'none' }}
        >
          Browse All Subscriptions
        </Link>
      </div>
    );
  }

  const safePlans = (product.plans && product.plans.length > 0) ? product.plans : [
    {
      duration: product.defaultPlan || selectedDuration || '1 Month',
      price: Number(product.price) || 199,
      originalPrice: Number(product.comparePrice) || 499,
      discountPercentage: 20
    }
  ];

  const selectedPlan: ProductPlan = 
    safePlans.find(p => p.duration === selectedDuration) || safePlans[0];

  const effectivePrice = product.inOffers && product.offerPrice ? Number(product.offerPrice) : Number(selectedPlan.price || 199);
  const originalPrice = product.inOffers && product.offerOriginalPrice ? Number(product.offerOriginalPrice) : Number(selectedPlan.originalPrice || 499);
  const discountPct = (originalPrice > effectivePrice && originalPrice > 0) 
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) 
    : (selectedPlan.discountPercentage || 0);

  const [quantity, setQuantity] = useState(1);

  const isInCart = items.some(
    i => i.productId === product.id && i.planDuration === selectedDuration
  );

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, selectedDuration, quantity);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    addToCart(product, selectedDuration, quantity);
    navigate('/cart');
  };

  const targetPhone = (whatsAppSettings?.number || '919441323332').replace(/[^0-9]/g, '');
  const enquiryTemplate = whatsAppSettings?.itemEnquiryTemplate || 'Hi OTT Sellers! Is {productName} ({duration}) available for instant activation at ₹{price}?';
  const whatsappMessage = ottApi.formatWhatsAppEnquiryMessage(enquiryTemplate, {
    productName: product.name || 'OTT Subscription',
    duration: selectedDuration,
    price: effectivePrice,
    category: product.categoryName || product.categorySlug || 'OTT'
  });
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Main Product Layout: Focused Purchase Flow */}
        <div className="product-main-grid">
          {/* Left Column: Square Product Showcase */}
          <div className="product-media-column">
            <div 
              className="product-large-preview"
              style={{ backgroundColor: product.brandColor || '#0b132b', aspectRatio: '1 / 1' }}
            >
              <img 
                src={getCleanImageUrl(product.image, product.updatedAt)} 
                alt={product.name} 
                className="product-detail-img"
              />
              <div className="product-detail-media-overlay">
                <span className="product-detail-brand-badge">
                  {product.brandLogoText || (product.name ? product.name.split(' ')[0] : 'OTT')}
                </span>
              </div>
              {discountPct > 0 && (
                <span className="detail-discount-tag">
                  {discountPct}% OFF
                </span>
              )}
            </div>

            {/* Trust Assurances */}
            <div className="product-trust-assurances">
              <div className="assurance-item">
                <Clock size={16} className="assurance-icon icon-clock" />
                <div>
                  <strong>Instant Delivery</strong>
                  <p>Credentials in 5-15 mins via WhatsApp & Email</p>
                </div>
              </div>

              <div className="assurance-item">
                <ShieldCheck size={16} className="assurance-icon icon-shield" />
                <div>
                  <strong>{product.warrantyPeriod || 'Full Duration Warranty'}</strong>
                  <p>100% replacement guarantee if any issue arises</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Plan Selector, CTA */}
          <div className="product-info-column">
            <div className="product-title-row">
              <h1 className="product-detail-title">{product.name}</h1>
              {product.inStock ? (
                <span className="stock-pill in-stock">
                  <Check size={13} /> In Stock ({product.stockCount || 25}+ Available)
                </span>
              ) : (
                <span className="stock-pill out-of-stock" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                  <X size={13} /> Out of Stock
                </span>
              )}
            </div>

            {product.providerName && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', background: 'rgba(168, 85, 247, 0.1)', color: '#9333ea', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  ⚡ Quick Select Provider: {product.providerName}
                </span>
              </div>
            )}

            {product.tagline && (
              <p className="product-tagline">{product.tagline}</p>
            )}

            {/* Rating */}
            <div className="product-detail-rating-row">
              <div className="rating-stars-badge">
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <span>{typeof product.rating === 'number' && !isNaN(product.rating) ? product.rating.toFixed(1) : '4.9'}</span>
              </div>
              <span className="rating-count-text">
                ({Number(product.reviewsCount || 120).toLocaleString()} verified customer ratings)
              </span>
            </div>

            {/* Reactive Dynamic Price Display */}
            <div className="product-dynamic-price-box">
              <div className="dynamic-price-left">
                <span className="detail-selling-price">₹ {effectivePrice}</span>
                {originalPrice > effectivePrice && (
                  <span className="detail-original-price">₹ {originalPrice}</span>
                )}
                {originalPrice > effectivePrice && (
                  <span className="detail-savings-badge">
                    Save ₹{originalPrice - effectivePrice} ({discountPct}% OFF)
                  </span>
                )}
              </div>
              <span className="detail-tax-note">All taxes included • Instant WhatsApp activation</span>
            </div>

            {/* Plan Selector if multiple plans exist */}
            {product.plans && product.plans.length > 1 && (
              <div className="plan-selector-container">
                <label className="plan-selector-label">
                  <span>Select Subscription Duration:</span>
                  <span className="selected-duration-highlight">{selectedDuration}</span>
                </label>
                
                <div className="plan-options-grid">
                  {product.plans.map(plan => {
                    const isSelected = plan.duration === selectedDuration;
                    return (
                      <button
                        key={plan.duration}
                        type="button"
                        className={`plan-option-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedDuration(plan.duration)}
                      >
                        {plan.isPopular && (
                          <span className="popular-plan-badge">Popular</span>
                        )}
                        <div className="plan-duration-title">
                          <span className="duration-text">{plan.duration}</span>
                          {isSelected && <Check size={14} className="plan-check-icon" />}
                        </div>
                        <div className="plan-card-pricing">
                          <span className="plan-card-price">₹ {plan.price}</span>
                          <span className="plan-card-original">₹ {plan.originalPrice}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#ffffff' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '6px 12px', background: '#f8fafc', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span style={{ padding: '6px 14px', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ padding: '6px 12px', background: '#f8fafc', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {!product.inStock && (
                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.82rem', background: '#fee2e2', padding: '4px 10px', borderRadius: '6px' }}>
                  Currently Out of Stock
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="product-actions-group">
              <button 
                type="button" 
                className={`btn-detail-add-cart ${isInCart ? 'added-state' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                style={{ opacity: product.inStock ? 1 : 0.6, cursor: product.inStock ? 'pointer' : 'not-allowed' }}
              >
                {isInCart ? (
                  <>
                    <Check size={16} />
                    <span>In Cart ({selectedDuration})</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button 
                type="button" 
                className="btn-detail-buy-now"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                style={{ opacity: product.inStock ? 1 : 0.6, cursor: product.inStock ? 'pointer' : 'not-allowed' }}
              >
                <Zap size={16} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* WhatsApp Direct Enquiry Button */}
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-whatsapp-enquiry"
            >
              <MessageCircle size={16} />
              <span>Direct WhatsApp Enquiry</span>
            </a>

            {/* Key Deliverables Highlights */}
            {product.features && product.features.length > 0 && (
              <div className="product-quick-features" style={{ marginTop: '16px' }}>
                <h3 className="quick-features-title">Subscription Highlights:</h3>
                <ul className="features-checklist">
                  {product.features.slice(0, 4).map((f, idx) => (
                    <li key={idx}>
                      <Check size={14} className="feature-check" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section" style={{ marginTop: '36px' }}>
            <div className="section-header">
              <h2 className="section-title">
                <span className="bar-indicator"></span>
                <span>You May Also Like</span>
              </h2>
              <Link to={`/items?category=${product.categorySlug}`} className="view-all-link">
                <span>View More in {product.categoryName}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className="product-grid five-cols">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
