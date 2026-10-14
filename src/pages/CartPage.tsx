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
import { PaymentSettings } from '../types';
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

  // Helper: Sanitize to 10 digits
  const sanitizePhone = (val: string): string => {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      return digits.slice(2, 12);
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      return digits.slice(1, 11);
    }
    return digits.slice(0, 10);
  };

  const isValidIndianMobile = (val: string): boolean => {
    const clean = sanitizePhone(val);
    return /^[6-9]\d{9}$/.test(clean);
  };

  // Customer Contact Fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(sanitizePhone(user?.mobile || ''));
  const [whatsapp, setWhatsapp] = useState(sanitizePhone(user?.whatsapp || user?.mobile || ''));
  const [email, setEmail] = useState(user?.email || '');
  const [remarks, setRemarks] = useState('');

  // Coupon State
  const [inputCouponCode, setInputCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Admin Settings (WhatsApp & Payment Methods)
  const [whatsappSettings, setWhatsappSettings] = useState<any>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadSettings = async () => {
      try {
        const [ws, ps] = await Promise.all([
          ottApi.getWhatsAppSettings(),
          ottApi.getPaymentSettings()
        ]);
        setWhatsappSettings(ws);
        setPaymentSettings(ps);
      } catch (err) {
        console.error('Failed to load settings in cart:', err);
      }
    };
    loadSettings();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizePhone(e.target.value);
    setPhone(clean);
    if (!whatsapp || whatsapp === phone) {
      setWhatsapp(clean);
    }
    if (formError) setFormError(null);
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizePhone(e.target.value);
    setWhatsapp(clean);
    if (formError) setFormError(null);
  };

  const handleClearCart = () => {
    setRemarks('');
    setInputCouponCode('');
    clearCart();
  };

  const handleRemoveItem = (productId: string, planDuration: string) => {
    if (items.length <= 1) {
      setRemarks('');
      setInputCouponCode('');
    }
    removeFromCart(productId, planDuration as any);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCouponCode.trim().toUpperCase();
    if (!cleanCode) return;
    setIsApplying(true);
    await applyCoupon(cleanCode);
    setIsApplying(false);
  };

  const handleOpenPaymentModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setFormError('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!isValidIndianMobile(phone)) {
      setFormError('Please enter a valid 10-digit Mobile Number starting with 6, 7, 8, or 9.');
      return;
    }
    if (!isValidIndianMobile(whatsapp)) {
      setFormError('Please enter a valid 10-digit WhatsApp Number for credentials delivery.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setFormError('Please enter a valid email address.');
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
          const paymentNotes = [
            remarks.trim() ? `Customer Note: ${remarks.trim()}` : null,
            `Razorpay Payment ID: ${paymentId}`
          ].filter(Boolean).join(' | ');

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
            notes: paymentNotes
          });

          handleClearCart();
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

      const orderNotes = [
        remarks.trim() ? `Customer Note: ${remarks.trim()}` : null,
        'Placed via direct WhatsApp checkout'
      ].filter(Boolean).join(' | ');

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
        notes: orderNotes
      });

      // Format dynamic template
      const itemsListText = items.map((it, idx) => `${idx + 1}. ${it.name} [${it.planDuration}] x ${it.quantity} = ₹${it.price * it.quantity}`).join('\n');
      
      const targetPhone = (whatsappSettings?.number || '9441323332').replace(/[^0-9]/g, '');
      let formattedMsg = ottApi.formatWhatsAppOrderMessage(whatsappSettings?.orderMessageTemplate, {
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

      if (remarks.trim()) {
        formattedMsg += `\n\n*Customer Remarks:* ${remarks.trim()}`;
      }

      handleClearCart();
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
            onClick={handleClearCart}
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
                        onClick={() => handleRemoveItem(item.productId, item.planDuration)}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', margin: 0 }}>Mobile Number *</label>
                    <span style={{ fontSize: '0.7rem', color: phone.length === 10 ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                      {phone.length === 10 ? '✓ 10 digits valid' : `${phone.length}/10 digits`}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#ffffff',
                    border: `1.5px solid ${phone.length === 10 && isValidIndianMobile(phone) ? '#16a34a' : phone.length > 0 && phone.length < 10 ? '#f59e0b' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{
                      padding: '9px 10px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#334155',
                      background: '#f8fafc',
                      borderRight: '1px solid #e2e8f0',
                      userSelect: 'none'
                    }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      className="form-input"
                      style={{ border: 'none', borderRadius: 0, padding: '9px 12px', fontSize: '0.86rem', flex: 1, outline: 'none', background: 'transparent' }}
                      placeholder="Enter 10 digits"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                    />
                    {phone.length === 10 && isValidIndianMobile(phone) && (
                      <Check size={16} color="#16a34a" style={{ marginRight: '10px', flexShrink: 0 }} />
                    )}
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', margin: 0 }}>WhatsApp Number (for Credentials) *</label>
                    <span style={{ fontSize: '0.7rem', color: whatsapp.length === 10 ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                      {whatsapp.length === 10 ? '✓ 10 digits valid' : `${whatsapp.length}/10 digits`}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#ffffff',
                    border: `1.5px solid ${whatsapp.length === 10 && isValidIndianMobile(whatsapp) ? '#16a34a' : whatsapp.length > 0 && whatsapp.length < 10 ? '#f59e0b' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{
                      padding: '9px 10px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#334155',
                      background: '#f8fafc',
                      borderRight: '1px solid #e2e8f0',
                      userSelect: 'none'
                    }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      className="form-input"
                      style={{ border: 'none', borderRadius: 0, padding: '9px 12px', fontSize: '0.86rem', flex: 1, outline: 'none', background: 'transparent' }}
                      placeholder="Enter 10 digits"
                      value={whatsapp}
                      onChange={handleWhatsAppChange}
                      required
                    />
                    {whatsapp.length === 10 && isValidIndianMobile(whatsapp) && (
                      <Check size={16} color="#16a34a" style={{ marginRight: '10px', flexShrink: 0 }} />
                    )}
                  </div>
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

                <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Order Remarks / Notes (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                    placeholder="e.g. Any special instructions, custom name preference, etc."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
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
                    onChange={(e) => setInputCouponCode(e.target.value)}
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="off"
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

      {/* Choose Payment Method Modal */}
      {isPaymentModalOpen && (
        <div className="checkout-modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-payment-title">
            <div className="checkout-modal-header">
              <div className="checkout-modal-title-wrap">
                <CreditCard size={20} className="checkout-modal-header-icon" />
                <h2 id="modal-payment-title" className="checkout-modal-title">Choose Payment Method</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="checkout-modal-close-btn"
                aria-label="Close payment options"
              >
                <X size={18} />
              </button>
            </div>

            <div className="checkout-modal-body">
              {/* Order & Delivery Summary Pill */}
              <div className="checkout-order-summary-box">
                <div className="summary-amount-row">
                  <span className="summary-amount-label">Total Payable:</span>
                  <span className="summary-amount-value">₹{totalPrice}</span>
                </div>
                <div className="summary-credentials-note">
                  Delivering credentials to: <strong>{whatsapp || phone}</strong> ({fullName})
                </div>
              </div>

              {/* Payment Methods */}
              <div className="payment-options-stack">
                {(!paymentSettings || (paymentSettings.online?.enabled ?? true)) && (
                  <button
                    type="button"
                    onClick={handleRazorpayPayment}
                    disabled={isProcessingPayment}
                    className="payment-option-card online-gateway-card"
                  >
                    <div className="payment-option-content">
                      <div className="payment-option-icon-box online-icon-box">
                        <CreditCard size={24} />
                      </div>
                      <div className="payment-option-texts">
                        <div className="payment-option-header-row">
                          <strong className="payment-option-heading">
                            {paymentSettings?.online?.title || 'Online Payment Gateway'}
                          </strong>
                          <span className="payment-fast-tag">
                            <span className="live-pulse-dot" style={{ width: '6px', height: '6px', background: '#38bdf8', display: 'inline-block', borderRadius: '50%', marginRight: '4px' }}></span>
                            Instant & Automated
                          </span>
                        </div>
                        <span className="payment-option-subtext">
                          {paymentSettings?.online?.description || 'Pay securely using supported UPI apps (GPay, PhonePe, Paytm), Cards, or NetBanking.'}
                        </span>
                        {/* Supported Apps / Cards Chips */}
                        <div className="payment-methods-chips-row">
                          <span className="pay-chip gpay">Google Pay</span>
                          <span className="pay-chip phonepe">PhonePe</span>
                          <span className="pay-chip paytm">Paytm</span>
                          <span className="pay-chip upi">BHIM UPI</span>
                          <span className="pay-chip cards">Cards</span>
                        </div>
                      </div>
                    </div>
                    <div className="payment-arrow-disc online-arrow-disc">
                      <ArrowRight size={18} className="payment-option-arrow" />
                    </div>
                  </button>
                )}

                {(!paymentSettings || (paymentSettings.whatsapp?.enabled ?? true)) && (
                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    disabled={isProcessingPayment}
                    className="payment-option-card whatsapp-instant-card"
                  >
                    <div className="payment-option-content">
                      <div className="payment-option-icon-box whatsapp-icon-box">
                        <MessageCircle size={24} />
                      </div>
                      <div className="payment-option-texts">
                        <div className="payment-option-header-row">
                          <strong className="payment-option-heading">
                            {paymentSettings?.whatsapp?.title || 'WhatsApp Instant Order'}
                          </strong>
                          <span className="payment-manual-tag">
                            <span className="live-pulse-dot" style={{ width: '6px', height: '6px', background: '#22c55e', display: 'inline-block', borderRadius: '50%', marginRight: '4px' }}></span>
                            Direct Team Support
                          </span>
                        </div>
                        <span className="payment-option-subtext">
                          {paymentSettings?.whatsapp?.description || 'Continue on WhatsApp to confirm your order with our team via manual UPI transfer.'}
                        </span>
                        <div className="payment-methods-chips-row">
                          <span className="pay-chip whatsapp">Chat & Pay</span>
                          <span className="pay-chip upi">Direct UPI QR</span>
                          <span className="pay-chip whatsapp">1-on-1 Assistance</span>
                        </div>
                      </div>
                    </div>
                    <div className="payment-arrow-disc whatsapp-arrow-disc">
                      <ArrowRight size={18} className="payment-option-arrow" />
                    </div>
                  </button>
                )}

                {paymentSettings && !paymentSettings.online?.enabled && !paymentSettings.whatsapp?.enabled && (
                  <div className="payment-unavailable-alert" style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '14px', borderRadius: '10px', fontSize: '0.85rem', textAlign: 'center' }}>
                    <AlertCircle size={20} style={{ margin: '0 auto 6px', display: 'block' }} />
                    <strong>Checkout is Temporarily Paused</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#7f1d1d' }}>
                      Please contact customer support via WhatsApp or email to complete your purchase.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
