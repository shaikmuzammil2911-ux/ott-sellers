import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertCircle, ArrowRight, MessageCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ottApi } from '../services/api';
import { paymentService } from '../services/paymentService';
import { Breadcrumb } from '../components/common/Breadcrumb';
import './CheckoutPage.css';

export const CheckoutPage: React.FC = () => {
  const { items, totalPrice, discountTotal, subtotal, appliedCoupon, couponDiscount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsapp || user?.mobile || '');

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <h2>Your Cart is Empty</h2>
          <p>Please add subscriptions to your cart before proceeding to checkout.</p>
          <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>
            Browse Subscriptions
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim() || !email.trim() || !whatsappNumber.trim()) {
      setErrorMsg('Please complete all required customer contact details.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Authoritative database pricing & stock verification
      const dbProducts = await ottApi.getProducts();
      let verifiedSubtotal = 0;

      // Check stock availability
      for (const item of items) {
        const dbProd = dbProducts.find(p => p.id === item.productId || p.slug === item.productSlug);
        if (dbProd && dbProd.inStock === false) {
          setErrorMsg(`"${dbProd.name}" is currently out of stock. Please remove it from your cart before checking out.`);
          setIsProcessing(false);
          return;
        }
      }

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

      // Open Razorpay Checkout
      await paymentService.openCheckout({
        orderId: `OTS_${Date.now()}`,
        amount: finalTotal,
        customerName: fullName,
        customerEmail: email,
        customerPhone: whatsappNumber,
        description: `OTT Sellers - ${items.length} Subscriptions Order`,
        onSuccess: async (paymentId: string) => {
          const newOrder = await ottApi.createOrder({
            customerName: fullName,
            customerEmail: email,
            customerMobile: mobileNumber,
            customerWhatsApp: whatsappNumber,
            items: orderItems,
            subtotal: verifiedSubtotal,
            discount: discountTotal,
            couponCode: appliedCoupon?.code,
            couponDiscount: couponDiscount,
            total: finalTotal,
            paymentMethod: 'Razorpay Secure Gateway (UPI / Card / NetBanking)',
            paymentStatus: 'Success',
            orderStatus: 'Paid',
            notes: `Razorpay Payment ID: ${paymentId}`
          });

          clearCart();
          setIsProcessing(false);
          navigate('/checkout/success', { state: { order: newOrder } });
        },
        onFailure: (err: string) => {
          setIsProcessing(false);
          setErrorMsg(err || 'Payment was cancelled or failed.');
        }
      });
    } catch {
      setIsProcessing(false);
      navigate('/checkout/failed', { state: { error: 'Payment processing encountered an unexpected issue.' } });
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <Breadcrumb items={[{ label: 'Cart', to: '/cart' }, { label: 'Secure Checkout' }]} />

        <div className="checkout-page-title-row">
          <h1 className="checkout-page-title">Complete Your Order</h1>
          <div className="secure-badge">
            <ShieldCheck size={18} className="shield-icon" />
            <span>256-Bit Encrypted & Verified</span>
          </div>
        </div>

        {errorMsg && (
          <div className="checkout-error-alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="checkout-grid">
          {/* Left Column: Customer details & Payment Options */}
          <div className="checkout-main-col">
            {/* Step 1: Customer Details */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <span className="step-badge">Step 1</span>
                <h2 className="checkout-card-heading">Contact & Delivery Details</h2>
              </div>
              <p className="card-subtext">
                Your subscription credentials, activation PIN, and receipts will be dispatched here.
              </p>

              <div className="form-fields-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number (For Instant Delivery) *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (For Backup Receipt) *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method UI — Official Razorpay Gateway Only */}
            <div className="checkout-card razorpay-gateway-card">
              <div className="checkout-card-header">
                <span className="step-badge">Step 2</span>
                <h2 className="checkout-card-heading">Payment Method</h2>
              </div>
              <p className="card-subtext">
                Secure 256-bit encrypted checkout powered exclusively by <strong>Razorpay</strong>.
              </p>

              <div className="razorpay-showcase-box">
                <div className="razorpay-brand-header">
                  <div className="razorpay-logo-badge">
                    <span className="rzp-shield-icon">🛡️</span>
                    <div>
                      <strong className="rzp-title">Razorpay Secure Checkout</strong>
                      <span className="rzp-sub">Official Trusted Indian Payment Gateway</span>
                    </div>
                  </div>
                  <span className="rzp-live-pill">● 100% Secure & Verified</span>
                </div>

                <div className="razorpay-methods-grid">
                  <div className="rzp-method-item">
                    <span className="rzp-method-icon">⚡</span>
                    <div>
                      <strong>Instant UPI</strong>
                      <span>Google Pay, PhonePe, Paytm, BHIM & Any UPI ID</span>
                    </div>
                  </div>
                  <div className="rzp-method-item">
                    <span className="rzp-method-icon">💳</span>
                    <div>
                      <strong>Debit & Credit Cards</strong>
                      <span>Visa, Mastercard, RuPay, Maestro & Amex</span>
                    </div>
                  </div>
                  <div className="rzp-method-item">
                    <span className="rzp-method-icon">🏦</span>
                    <div>
                      <strong>Net Banking</strong>
                      <span>SBI, HDFC, ICICI, Axis, Kotak & 50+ Banks</span>
                    </div>
                  </div>
                  <div className="rzp-method-item">
                    <span className="rzp-method-icon">👛</span>
                    <div>
                      <strong>Wallets & Pay Later</strong>
                      <span>Mobikwik, Freecharge, Airtel Money, etc.</span>
                    </div>
                  </div>
                </div>

                <div className="razorpay-instructions-banner">
                  <div className="instruction-check-bullet">✓</div>
                  <p>
                    When you click <strong>"Pay via Razorpay"</strong> below, the official Razorpay checkout window will open. Your subscription credentials and WhatsApp activation will be issued instantly once paid.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Final CTA */}
          <div className="checkout-sidebar-col">
            <div className="order-review-card">
              <h3 className="order-review-title">Order Items ({items.length})</h3>

              <div className="checkout-items-list">
                {items.map(item => (
                  <div key={`${item.productId}-${item.planDuration}`} className="checkout-item-mini">
                    <div className="mini-item-info">
                      <span className="mini-item-name">{item.name}</span>
                      <span className="mini-item-plan">{item.planDuration} × {item.quantity}</span>
                    </div>
                    <span className="mini-item-price">₹ {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="checkout-totals-group">
                <div className="checkout-total-row">
                  <span>Regular Total</span>
                  <span className="strike">₹ {subtotal}</span>
                </div>
                <div className="checkout-total-row discount">
                  <span>Discount</span>
                  <span>- ₹ {discountTotal}</span>
                </div>
                <div className="checkout-total-row grand-total">
                  <span>Total Payable</span>
                  <span className="price-bold">₹ {totalPrice}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn-place-order"
              >
                {isProcessing ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <span>Pay ₹{totalPrice} via Razorpay</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="checkout-support-box">
                <a 
                  href={`https://wa.me/919441323332?text=${encodeURIComponent(`Hi OTT Sellers, I am at checkout for ₹${totalPrice}. Need help with payment.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="checkout-whatsapp-btn"
                >
                  <MessageCircle size={16} />
                  <span>Facing issues? Contact WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
