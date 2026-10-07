import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, Plus, Minus, ArrowRight, ArrowLeft, 
  ShoppingBag, ShieldCheck, Zap, Tag, Check, X 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/common/EmptyState';
import './CartPage.css';

export const CartPage: React.FC = () => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal, 
    discountTotal, 
    totalPrice,
    appliedCoupon,
    couponDiscount,
    couponError,
    applyCoupon,
    removeCoupon
  } = useCart();
  const navigate = useNavigate();

  const [inputCouponCode, setInputCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCouponCode.trim()) return;
    setIsApplying(true);
    await applyCoupon(inputCouponCode.trim());
    setIsApplying(false);
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container" style={{ paddingTop: '30px', paddingBottom: '50px' }}>
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added any subscriptions to your cart yet. Explore our top OTT deals and start streaming today!"
            actionText="BROWSE SUBSCRIPTIONS"
            actionTo="/items"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header-title-row">
          <h1 className="cart-page-title">
            Shopping Cart <span>({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          </h1>
          <button 
            type="button" 
            className="clear-cart-text-btn"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>

        <div className="cart-layout-grid">
          {/* Left Column: Cart Items List */}
          <div className="cart-items-column">
            <div className="cart-items-card">
              {items.map((item) => (
                <div key={`${item.productId}-${item.planDuration}`} className="cart-item-row">
                  {/* Small Thumbnail Media */}
                  <div className="cart-item-media">
                    <img src={item.image} alt={item.name} />
                  </div>

                  {/* Info */}
                  <div className="cart-item-info">
                    <Link to={`/product/${item.productSlug}`} className="cart-item-name">
                      {item.name}
                    </Link>
                    <div className="cart-item-plan-badge">
                      <span>Plan: <strong>{item.planDuration}</strong></span>
                    </div>
                    <div className="cart-item-unit-pricing">
                      <span className="unit-price">₹ {item.price}</span>
                      {item.originalPrice > item.price && (
                        <span className="unit-original">₹ {item.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="cart-item-quantity-box">
                    <button 
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.planDuration, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.planDuration, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Subtotal & Remove */}
                  <div className="cart-item-actions">
                    <span className="cart-item-subtotal">₹ {item.price * item.quantity}</span>
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => removeFromCart(item.productId, item.planDuration)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="cart-bottom-actions">
              <Link to="/items" className="btn-continue-shopping">
                <ArrowLeft size={15} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="cart-summary-column">
            <div className="cart-summary-card">
              <h2 className="summary-card-title">Order Summary</h2>

              {/* Coupon Code Section */}
              <div className="cart-coupon-block">
                {appliedCoupon ? (
                  <div className="applied-coupon-pill">
                    <div className="coupon-pill-left">
                      <Tag size={15} className="tag-icon" />
                      <div>
                        <strong>{appliedCoupon.code}</strong>
                        <span className="applied-discount-text">
                          Saved ₹{couponDiscount}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="btn-remove-coupon"
                      title="Remove coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="coupon-input-form">
                    <div className="coupon-input-wrap">
                      <Tag size={15} className="coupon-icon" />
                      <input
                        type="text"
                        placeholder="Enter Coupon Code (e.g. OTT20)"
                        value={inputCouponCode}
                        onChange={(e) => setInputCouponCode(e.target.value)}
                        autoCapitalize="characters"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplying || !inputCouponCode.trim()}
                      className="btn-apply-coupon"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="coupon-error-text">{couponError}</p>
                )}
              </div>

              {/* Summary Breakdown */}
              <div className="summary-rows-group">
                <div className="summary-row">
                  <span>Subtotal (Regular Price)</span>
                  <span className="strike-text">₹ {subtotal}</span>
                </div>

                <div className="summary-row discount">
                  <span>Plan Savings</span>
                  <span className="discount-green">- ₹ {subtotal - (totalPrice + couponDiscount)}</span>
                </div>

                {appliedCoupon && couponDiscount > 0 && (
                  <div className="summary-row coupon-discount-row">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span className="discount-green">- ₹ {couponDiscount}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Instant Delivery & Setup</span>
                  <span className="free-text">FREE</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Grand Total</span>
                  <span className="total-amount">₹ {totalPrice}</span>
                </div>
              </div>

              <button 
                type="button" 
                className="btn-checkout-primary"
                onClick={() => navigate('/checkout')}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="checkout-trust-points">
                <div className="trust-point-item">
                  <Zap size={15} className="trust-point-icon zap" />
                  <span>Instant WhatsApp Activation</span>
                </div>
                <div className="trust-point-item">
                  <ShieldCheck size={15} className="trust-point-icon shield" />
                  <span>100% Replacement Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
