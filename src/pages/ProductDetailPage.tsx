import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, ShoppingCart, Zap, MessageCircle, ShieldCheck, Check, 
  HelpCircle, ChevronDown, ChevronUp, Clock, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../services/api';
import { Product, PlanDuration, ProductPlan } from '../types';
import { useCart } from '../context/CartContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ProductCard } from '../components/common/ProductCard';
import './ProductDetailPage.css';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>('1 Month');
  const [activeTab, setActiveTab] = useState<'features' | 'how-it-works' | 'rules' | 'faqs'>('features');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProduct = async () => {
      if (!slug) return;
      setLoading(true);
      const prod = await ottApi.getProductBySlug(slug);
      if (prod) {
        setProduct(prod);
        setSelectedDuration(prod.defaultPlan);
        const related = await ottApi.getProductsByCategory(prod.categorySlug);
        setRelatedProducts(related.filter(r => r.id !== prod.id).slice(0, 4));
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
        <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Homepage
        </Link>
      </div>
    );
  }

  const selectedPlan: ProductPlan = 
    product.plans.find(p => p.duration === selectedDuration) || product.plans[0];

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

  const whatsappMessage = `Hi OTT Sellers, I am interested in ${product.name} - ${selectedDuration} (₹${selectedPlan.price}). Can you assist with activation?`;
  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Categories', to: '/catalogs' },
            { label: product.categoryName, to: `/category/${product.categorySlug}` },
            { label: product.name }
          ]}
        />

        {/* Main Product Layout: Media on Left, Details on Right */}
        <div className="product-main-grid">
          {/* Left Column: Product Showcase */}
          <div className="product-media-column">
            <div 
              className="product-large-preview"
              style={{ backgroundColor: product.brandColor || '#0b132b' }}
            >
              <img 
                src={getCleanImageUrl(product.image, product.updatedAt)} 
                alt={product.name} 
                className="product-detail-img"
              />
              <div className="product-detail-media-overlay">
                <span className="product-detail-brand-badge">
                  {product.brandLogoText || product.name}
                </span>
              </div>
              <span className="detail-discount-tag">
                {selectedPlan.discountPercentage}% OFF
              </span>
            </div>

            {/* Trust Assurances */}
            <div className="product-trust-assurances">
              <div className="assurance-item">
                <Clock size={18} className="assurance-icon icon-clock" />
                <div>
                  <strong>Instant Delivery</strong>
                  <p>Credentials in 5-15 mins via WhatsApp & Email</p>
                </div>
              </div>

              <div className="assurance-item">
                <ShieldCheck size={18} className="assurance-icon icon-shield" />
                <div>
                  <strong>{product.warrantyPeriod}</strong>
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
                <Check size={14} /> In Stock ({product.stockCount || 25}+ Available)
              </span>
            </div>

            <p className="product-tagline">{product.tagline}</p>

            {/* Rating */}
            <div className="product-detail-rating-row">
              <div className="rating-stars-badge">
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span className="rating-count-text">
                ({product.reviewsCount.toLocaleString()} verified customer ratings)
              </span>
            </div>

            {/* Reactive Dynamic Price Display */}
            <div className="product-dynamic-price-box">
              <div className="dynamic-price-left">
                <span className="detail-selling-price">₹ {selectedPlan.price}</span>
                <span className="detail-original-price">₹ {selectedPlan.originalPrice}</span>
                <span className="detail-savings-badge">
                  You Save ₹{selectedPlan.originalPrice - selectedPlan.price} ({selectedPlan.discountPercentage}% OFF)
                </span>
              </div>
              <span className="detail-tax-note">All taxes included • Instant activation</span>
            </div>

            {/* Plan Selector (Requirement 13) */}
            <div className="plan-selector-container">
              <label className="plan-selector-label">
                <span>Select Subscription Plan Duration:</span>
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
                        {isSelected && <Check size={16} className="plan-check-icon" />}
                      </div>
                      <div className="plan-card-pricing">
                        <span className="plan-card-price">₹ {plan.price}</span>
                        <span className="plan-card-original">₹ {plan.originalPrice}</span>
                      </div>
                      <span className="plan-card-discount">
                        Save {plan.discountPercentage}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="product-actions-group">
              <button 
                type="button" 
                className={`btn-detail-add-cart ${isInCart ? 'added-state' : ''}`}
                onClick={handleAddToCart}
              >
                {isInCart ? (
                  <>
                    <Check size={18} />
                    <span>Added To Cart ({selectedDuration})</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button 
                type="button" 
                className="btn-detail-buy-now"
                onClick={handleBuyNow}
              >
                <Zap size={18} />
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
              <MessageCircle size={18} />
              <span>Instant WhatsApp Enquiry</span>
            </a>

            {/* Quick Feature Checklist */}
            <div className="product-quick-features">
              <h3 className="quick-features-title">Subscription Highlights:</h3>
              <ul className="features-checklist">
                {product.features.slice(0, 4).map((f, idx) => (
                  <li key={idx}>
                    <Check size={16} className="feature-check" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Section */}
        <div className="product-details-tabs-section">
          <div className="tabs-nav-bar">
            <button 
              className={`tab-nav-btn ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Features & Specs
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'how-it-works' ? 'active' : ''}`}
              onClick={() => setActiveTab('how-it-works')}
            >
              How It Works & Delivery
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              Rules & Terms
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'faqs' ? 'active' : ''}`}
              onClick={() => setActiveTab('faqs')}
            >
              FAQs ({product.faqs.length})
            </button>
          </div>

          <div className="tab-content-panel">
            {activeTab === 'features' && (
              <div className="tab-pane">
                <h3 className="tab-pane-title">All Included Features</h3>
                <ul className="detailed-features-list">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="detailed-feature-item">
                      <div className="feature-bullet-icon">
                        <Check size={16} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'how-it-works' && (
              <div className="tab-pane">
                <h3 className="tab-pane-title">What You Will Receive (Deliverables)</h3>
                <ul className="detailed-features-list">
                  {product.deliverables.map((del, idx) => (
                    <li key={idx} className="detailed-feature-item">
                      <div className="feature-bullet-icon">
                        <Zap size={16} />
                      </div>
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
                <div className="delivery-time-callout">
                  <Clock size={20} />
                  <span>
                    Average dispatch speed is <strong>5 - 15 minutes</strong> after payment confirmation.
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="tab-pane">
                <h3 className="tab-pane-title">Guidelines for Smooth Streaming</h3>
                <ul className="detailed-features-list">
                  {product.rules.map((rule, idx) => (
                    <li key={idx} className="detailed-feature-item rule-item">
                      <div className="feature-bullet-icon rule">
                        <AlertTriangle size={16} />
                      </div>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'faqs' && (
              <div className="tab-pane">
                <h3 className="tab-pane-title">Frequently Asked Questions</h3>
                <div className="product-faqs-accordion">
                  {product.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="faq-accordion-item">
                        <button
                          type="button"
                          className="faq-question-btn"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        >
                          <HelpCircle size={18} className="faq-icon" />
                          <span className="faq-q-text">{faq.question}</span>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {isOpen && (
                          <div className="faq-answer-body">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="bar-indicator"></span>
                <span>You May Also Like</span>
              </h2>
              <Link to={`/category/${product.categorySlug}`} className="view-all-link">
                <span>View More in {product.categoryName}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="product-grid">
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
