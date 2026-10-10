import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, 
  ShieldCheck, Zap, Tag, Check, X, MessageCircle, 
  CreditCard, Smartphone, AlertCircle, ArrowLeft, Lock 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ottApi } from '../services/api';
import { paymentService } from '../services/paymentService';
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
  const { user } = useAuth();
  const navigate = useNavigate();

  // Customer Contact Fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.mobile || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');

  // Coupon State
  const [inputCouponCode, setInputCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // WhatsApp Admin Settings
  const [whatsappSettings, setWhatsappSettings] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadWs = async () => {
      try {
        const ws = await ottApi.getWhatsAppSettings();
        setWhatsappSettings(ws);
      } catch {}
    };
    loadWs();
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCouponCode.trim()) return;
    setIsApplying(true);
    await applyCoupon(inputCouponCode.trim());
    setIsApplying(false);
  };

  const handleOpenPaymentModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setFormError('Please enter your Name, Phone Number, and Email to proceed.');
      return;
    }
    setFormError(null);
    setIsPaymentModalOpen(true);
  };

  // 1. Process Online Payment via Razorpay
  const handleRazorpayPayment = async () => {
    setIsProcessingPayment(true);
    setFormError(null);

    try {
      // Authoritative pricing revalidation
      const dbProducts = await ottApi.getProducts();
      let verifiedSubtotal = 0;
      const orderItems = items.map(i => {
        const dbProd = dbProducts.find(p => p.id === i.productId || p.slug === i.productSlug);
        const plan = dbProd?.plans?.find(p => p.duration === i.planDuration);
        const authoritativePrice = plan ? (dbProd?.inOffers && dbProd.offerPrice ? dbProd.offerPrice : plan.price) : i.price;
        verifiedSubtotal += authoritativePrice * i.quantity;

        return {
          productId: i.productId,
          name: `${i.name} (${i.planDuration})`,
          planDuration: i.planDuration,
          price: authoritativePrice,
          quantity: i.quantity,
          credentials: {
            instruction: 'Credentials and login guide will be sent directly to your WhatsApp Number shortly.'
          }
        };
      });

      const finalTotal = totalPrice;

      await paymentService.openCheckout({
        orderId: `OTS_${Date.now()}`,
        amount: finalTotal,
        customerName: fullName,
        customerEmail: email,
        customerPhone: whatsapp || phone,
        description: `OTT Sellers - ${items.length} Subscriptions Order`,
        onSuccess: async (paymentId: string) => {
          const newOrder = await ottApi.createOrder({
            customerName: fullName,
            customerEmail: email,
            customerMobile: phone,
            customerWhatsApp: whatsapp || phone,
            items: orderItems,
            subtotal: verifiedSubtotal,
            discount: discountTotal,
            couponCode: appliedCoupon?.code,
            couponDiscount: couponDiscount,
            total: finalTotal,
            paymentMethod: 'Razorpay Secure Online (UPI / Card / NetBanking)',
            paymentStatus: 'Success',
            orderStatus: 'Paid',
            notes: `Razorpay Payment ID: ${paymentId}`
          });

          clearCart();
          setIsPaymentModalOpen(false);
          navigate(`/checkout/success?orderId=${newOrder.id}`);
        },
        onFailure: (errorMsg: string) => {
          setFormError(errorMsg || 'Payment was cancelled or failed.');
          setIsProcessingPayment(false);
        }
      });
    } catch (err: any) {
      setFormError(err?.message || 'Payment initiation failed. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  // 2. Process WhatsApp Direct Order
  const handleWhatsAppOrder = async () => {
    setIsProcessingPayment(true);
    try {
      const dbProducts = await ottApi.getProducts();
      let verifiedSubtotal = 0;
      const orderItems = items.map(i => {
        const dbProd = dbProducts.find(p => p.id === i.productId || p.slug === i.productSlug);
        const plan = dbProd?.plans?.find(p => p.duration === i.planDuration);
        const authoritativePrice = plan ? (dbProd?.inOffers && dbProd.offerPrice ? dbProd.offerPrice : plan.price) : i.price;
        verifiedSubtotal += authoritativePrice * i.quantity;

        return {
          productId: i.productId,
          name: `${i.name} (${i.planDuration})`,
          planDuration: i.planDuration,
          price: authoritativePrice,
          quantity: i.quantity
        };
      });

      const finalTotal = totalPrice;

      // Create Pending Order Record
      const newOrder = await ottApi.createOrder({
        customerName: fullName,
        customerEmail: email,
        customerMobile: phone,
        customerWhatsApp: whatsapp || phone,
        items: orderItems,
        subtotal: verifiedSubtotal,
        discount: discountTotal,
        couponCode: appliedCoupon?.code,
        couponDiscount: couponDiscount,
        total: finalTotal,
        paymentMethod: 'WhatsApp Instant Verification & UPI',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        notes: 'Placed via direct WhatsApp checkout'
      });

      // Format dynamic template
      const itemsListText = items.map((it, idx) => `${idx + 1}. ${it.name} [${it.planDuration}] x ${it.quantity} = ₹${it.price * it.quantity}`).join('\n');
      
      const targetPhone = (whatsappSettings?.number || '9441323332').replace(/[^0-9]/g, '');
      const formattedMsg = ottApi.formatWhatsAppOrderMessage(whatsappSettings?.orderMessageTemplate, {
        order_id: newOrder.id,
        customer_name: fullName,
        customer_phone: whatsapp || phone,
        items: itemsListText,
        subtotal: subtotal,
        coupon_code: appliedCoupon?.code || 'None',
        discount: couponDiscount,
        final_amount: finalTotal,
        payment_status: 'Pending Verification'
      });

      clearCart();
      setIsPaymentModalOpen(false);
      window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(formattedMsg)}`, '_blank');
      navigate(`/account/orders/${newOrder.id}`);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to generate WhatsApp order.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container" style={{ paddingTop: '30px', paddingBottom: '50px' }}>
          <EmptyState
            icon={ShoppingBag}
            title="Your Cart is Empty"
            description="Explore our top OTT subscriptions and start streaming today with instant credentials delivery."
            actionText="CONTINUE SHOPPING"
            actionTo="/items"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Header */}
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

        {formError && (
          <div className="cart-alert-error" style={{ marginBottom: '16px', background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <div className="cart-layout-grid">
          {/* Left Column: Items List & Customer Details */}
          <div className="cart-items-column">
            {/* 1. Items List */}
            <div className="cart-items-card">
              <div className="cart-items-header-bar">
                <h2 className="cart-card-title">1. Selected Subscriptions ({items.length})</h2>
              </div>
              {items.map((item) => (
                <div key={`${item.productId}-${item.planDuration}`} className="cart-item-row">
                  {/* Square Media */}
                  <div className="cart-item-media">
                    <img src={item.image || '/placeholder-ott.png'} alt={item.name} />
                  </div>

                  {/* Details Column */}
                  <div className="cart-item-main-details">
                    {/* Top Row: Title on Left, Delete Button on Top-Right */}
                    <div className="cart-item-top-row">
                      <div className="cart-item-title-wrap">
                        <Link to={`/product/${item.productSlug}`} className="cart-item-name" title={item.name}>
                          {item.name}
                        </Link>
                        <div className="cart-item-plan-badge">
                          <span>Plan: <strong>{item.planDuration}</strong></span>
                        </div>
                      </div>

                      {/* Delete Button (Aligned at Top-Right of Item Name, above Amount) */}
                      <button 
                        type="button" 
                        className="cart-item-delete-btn"
                        onClick={() => removeFromCart(item.productId, item.planDuration)}
                        aria-label={`Remove ${item.name} from cart`}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Bottom Row: Quantity Stepper on Left, Price / Amount on Right (Below Delete Button) */}
                    <div className="cart-item-bottom-row">
                      {/* Quantity Stepper */}
                      <div className="cart-item-quantity-box">
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.productId, item.planDuration, item.quantity - 1)}
                          className="qty-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.productId, item.planDuration, item.quantity + 1)}
                          className="qty-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Amount (Positioned below the delete button) */}
                      <div className="cart-item-pricing-box">
                        <span className="cart-item-total-price">₹{item.price * item.quantity}</span>
                        {item.quantity > 1 && (
                          <span className="cart-item-unit-note">₹{item.price} each</span>
                        )}
                        {item.originalPrice > item.price && (
                          <span className="cart-item-original-price">₹{item.originalPrice * item.quantity}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Customer Details Section (Single-Step Flow) */}
            <div className="cart-items-card" style={{ marginTop: '16px', padding: '16px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
                2. Customer & Delivery Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (!whatsapp) setWhatsapp(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>WhatsApp Number (for Credentials) *</label>
                  <input
                    type="tel"
                    className="form-input"
                    style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                    placeholder="WhatsApp number"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Coupon, Summary & Pay Now */}
          <div className="cart-summary-column">
            {/* Coupon Card */}
            <div className="cart-summary-card coupon-box">
              <div className="coupon-header">
                <Tag size={16} className="coupon-icon" />
                <span>Apply Coupon Code</span>
              </div>

              {appliedCoupon ? (
                <div className="applied-coupon-pill">
                  <div className="applied-coupon-info">
                    <Check size={14} className="coupon-check" />
                    <div>
                      <strong>{appliedCoupon.code}</strong>
                      <span>(Save ₹{couponDiscount})</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="remove-coupon-btn" 
                    onClick={removeCoupon}
                    title="Remove coupon"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={inputCouponCode}
                    onChange={(e) => setInputCouponCode(e.target.value.toUpperCase())}
                    className="coupon-input"
                  />
                  <button 
                    type="submit" 
                    className="btn-apply-coupon"
                    disabled={isApplying || !inputCouponCode.trim()}
                  >
                    {isApplying ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && (
                <span className="coupon-error-msg">{couponError}</span>
              )}
            </div>

            {/* Price Summary Card */}
            <div className="cart-summary-card order-totals-card">
              <h3 className="summary-title">Price Summary</h3>

              <div className="summary-line-item">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal}</span>
              </div>

              {discountTotal > 0 && (
                <div className="summary-line-item discount-row">
                  <span>Catalog / Plan Savings</span>
                  <span className="discount-amount">- ₹{discountTotal}</span>
                </div>
              )}

              {appliedCoupon && couponDiscount > 0 && (
                <div className="summary-line-item coupon-row">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span className="coupon-amount">- ₹{couponDiscount}</span>
                </div>
              )}

              <div className="summary-total-divider" />

              <div className="summary-total-line">
                <span className="total-label">Final Amount</span>
                <span className="total-amount">₹{totalPrice}</span>
              </div>

              {/* Pay Now Button (Direct Modal Trigger) */}
              <button 
                type="button" 
                className="btn-checkout-primary"
                onClick={handleOpenPaymentModal}
              >
                <Lock size={16} />
                <span>Pay Now (₹{totalPrice})</span>
              </button>

              <div className="cart-security-badge" style={{ marginTop: '14px' }}>
                <ShieldCheck size={16} className="security-icon" />
                <span>100% Secure Checkout & Instant WhatsApp Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Options Popup / Modal (Requirement 51 & 53) */}
      {isPaymentModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#0284c7" />
                <span>Choose Payment Method</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="admin-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                  <span>Total Payable:</span>
                  <span style={{ fontSize: '1.1rem', color: '#0284c7' }}>₹{totalPrice}</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
                  Delivering credentials to: <strong>{whatsapp || phone}</strong> ({fullName})
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Method 1: Razorpay Online Payment */}
                <button
                  type="button"
                  onClick={handleRazorpayPayment}
                  disabled={isProcessingPayment}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: '#ffffff',
                    border: '1.5px solid #0284c7',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#e0f2fe', color: '#0284c7', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>Online Payment Gateway</strong>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>UPI (GPay, PhonePe, Paytm), Cards, NetBanking</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#0284c7" />
                </button>

                {/* Method 2: Direct WhatsApp Verification & Instant Pay */}
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  disabled={isProcessingPayment}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: '#ffffff',
                    border: '1.5px solid #22c55e',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#dcfce7', color: '#16a34a', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>WhatsApp Instant Order</strong>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Chat with agent, send order via prefilled message & pay</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#16a34a" />
                </button>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="btn-refresh-action"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
