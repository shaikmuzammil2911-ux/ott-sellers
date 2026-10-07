import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, ShoppingCart, Zap, MessageCircle, ShieldCheck, Check, 
  HelpCircle, ChevronDown, ChevronUp, Clock, AlertTriangle, ArrowRight 
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProduct = async () => {
      if (!slug) return;
      setLoading(true);
      const prod = await ottApi.getProductBySlug(slug);
      if (prod) {
        setProduct(prod);
        setSelectedDuration(prod.defaultPlan || '1 Month');
        const related = await ottApi.getProductsByCategory(prod.categorySlug);
        setRelatedProducts(related.filter(r => r.id !== prod.id).slice(0, 5));
      }
      setLoading(false);
    };

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p>Loading subscription details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Subscription Not Found</h2>
        <p>The product you are looking for does not exist or may have been updated.</p>
        <Link to="/items" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Browse All Subscriptions
        </Link>
      </div>
    );
  }

  const selectedPlan: ProductPlan = 
    product.plans?.find(p => p.duration === selectedDuration) || product.plans?.[0] || {
      duration: selectedDuration,
      price: product.price || 199,
      originalPrice: product.comparePrice || 499,
      discountPercentage: 20
    };

  const effectivePrice = product.inOffers && product.offerPrice ? product.offerPrice : selectedPlan.price;
  const originalPrice = product.inOffers && product.offerOriginalPrice ? product.offerOriginalPrice : selectedPlan.originalPrice;
  const discountPct = originalPrice > effectivePrice ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : selectedPlan.discountPercentage;

  const isInCart = items.some(
    i => i.productId === product.id && i.planDuration === selectedDuration
  );

  const handleAddToCart = () => {
    addToCart(product, selectedDuration, 1);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedDuration, 1);
    navigate('/checkout');
  };

  const whatsappMessage = `Hi OTT Sellers, I am interested in ${product.name} - ${selectedDuration} (₹${effectivePrice}). Can you assist with activation?`;
  const whatsappUrl = `https://wa.me/919441323332?text=${encodeURIComponent(whatsappMessage)}`;

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
                  {product.brandLogoText || product.name.split(' ')[0]}
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
              <span className="stock-pill in-stock">
                <Check size={13} /> In Stock ({product.stockCount || 25}+ Available)
              </span>
            </div>

            {product.tagline && (
              <p className="product-tagline">{product.tagline}</p>
            )}

            {/* Rating */}
            <div className="product-detail-rating-row">
              <div className="rating-stars-badge">
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <span>{product.rating ? product.rating.toFixed(1) : '4.9'}</span>
              </div>
              <span className="rating-count-text">
                ({(product.reviewsCount || 120).toLocaleString()} verified customer ratings)
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

            {/* Action Buttons */}
            <div className="product-actions-group">
              <button 
                type="button" 
                className={`btn-detail-add-cart ${isInCart ? 'added-state' : ''}`}
                onClick={handleAddToCart}
              >
                {isInCart ? (
                  <>
                    <Check size={16} />
                    <span>Added To Cart ({selectedDuration})</span>
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
