import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck, Zap, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
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
    totalPrice 
  } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <Breadcrumb items={[{ label: 'Shopping Cart' }]} />
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added any subscriptions to your cart yet. Explore our top OTT deals and start streaming today!"
            actionText="EXPLORE PRODUCTS"
            actionTo="/catalogs"
          />
        </div>
      </div>
    );
  }

  const whatsappCartMessage = `Hi OTT Sellers, I need help with my cart containing ${items.length} subscription(s) worth ₹${totalPrice}.`;
  const whatsappUrl = `https://wa.me/919441323332?text=${encodeURIComponent(whatsappCartMessage)}`;

  return (
    <div className="cart-page">
      <div className="container">
        <Breadcrumb items={[{ label: 'Shopping Cart' }]} />

        <div className="cart-header-title-row">
          <h1 className="cart-page-title">
            Your Shopping Cart <span>({items.length} {items.length === 1 ? 'item' : 'items'})</span>
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
                  {/* Media */}
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
                      <span className="unit-original">₹ {item.originalPrice}</span>
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="cart-item-quantity-box">
                    <button 
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.planDuration, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.planDuration, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Total & Remove */}
                  <div className="cart-item-actions">
                    <span className="cart-item-subtotal">₹ {item.price * item.quantity}</span>
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => removeFromCart(item.productId, item.planDuration)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="cart-bottom-actions">
              <Link to="/catalogs" className="btn-continue-shopping">
                <ArrowLeft size={16} />
                <span>Continue Shopping</span>
              </Link>

              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="cart-whatsapp-help-btn"
              >
                <MessageCircle size={16} />
                <span>Need Cart Assistance on WhatsApp?</span>
              </a>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="cart-summary-column">
            <div className="cart-summary-card">
              <h2 className="summary-card-title">Order Summary</h2>

              <div className="summary-rows-group">
                <div className="summary-row">
                  <span>Subtotal (Regular Price)</span>
                  <span className="strike-text">₹ {subtotal}</span>
                </div>

                <div className="summary-row discount">
                  <span>Special Discount Savings</span>
                  <span className="discount-green">- ₹ {discountTotal}</span>
                </div>

                <div className="summary-row">
                  <span>Activation & Delivery Fee</span>
                  <span className="free-text">FREE (Instant)</span>
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
                <ArrowRight size={18} />
              </button>

              <div className="checkout-trust-points">
                <div className="trust-point-item">
                  <Zap size={16} className="trust-point-icon zap" />
                  <span>Instant Credentials Delivery via WhatsApp</span>
                </div>
                <div className="trust-point-item">
                  <ShieldCheck size={16} className="trust-point-icon shield" />
                  <span>100% Replacement Warranty Included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
