import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, QrCode, CreditCard, Landmark, Upload, 
  Check, AlertCircle, ArrowLeft, ArrowRight, MessageCircle, X 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ottApi } from '../services/api';
import { paymentService } from '../services/paymentService';
import { Breadcrumb } from '../components/common/Breadcrumb';
import './CheckoutPage.css';

export const CheckoutPage: React.FC = () => {
  const { items, totalPrice, discountTotal, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsapp || user?.mobile || '');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
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

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setErrorMsg('Please upload a valid image file (PNG, JPG, or JPEG).');
        return;
      }
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim() || !email.trim() || !whatsappNumber.trim()) {
      setErrorMsg('Please complete all required customer contact details.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Authoritative database pricing verification
      const dbProducts = await ottApi.getProducts();
      let verifiedSubtotal = 0;
      const orderItems = items.map(i => {
        const dbProd = dbProducts.find(p => p.id === i.productId || p.slug === i.productSlug);
        const plan = dbProd?.plans.find(p => p.duration === i.planDuration);
        const authoritativePrice = plan ? plan.price : i.price;
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

      const finalTotal = Math.max(verifiedSubtotal - discountTotal, 0);

      // Open Razorpay Checkout or Direct Verification
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
            total: finalTotal,
            paymentMethod: paymentMethod === 'upi' ? 'UPI (QR / Google Pay / PhonePe)' : paymentMethod === 'card' ? 'Credit / Debit Card' : 'Net Banking',
            paymentStatus: 'Success',
            orderStatus: 'Paid',
            screenshotUrl: screenshotPreview || undefined,
            notes: `Payment Ref: ${paymentId}`
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

            {/* Step 2: Payment Method UI */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <span className="step-badge">Step 2</span>
                <h2 className="checkout-card-heading">Select Payment Method</h2>
              </div>

              {/* Payment Tabs */}
              <div className="payment-tabs-grid">
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <QrCode size={20} />
                  <span>UPI / QR Code</span>
                </button>

                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={20} />
                  <span>Card (Debit/Credit)</span>
                </button>

                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('netbanking')}
                >
                  <Landmark size={20} />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Payment Tab Details */}
              <div className="payment-tab-body">
                {paymentMethod === 'upi' && (
                  <div className="upi-payment-view">
                    <div className="upi-qr-card">
                      <div className="qr-box-mock">
                        <QrCode size={110} color="#0b132b" />
                        <span className="qr-scan-note">Scan with any UPI App</span>
                      </div>

                      <div className="upi-details-col">
                        <div className="upi-id-pill">
                          <span className="label">UPI ID:</span>
                          <strong>ottsellers@upi</strong>
                        </div>
                        <div className="supported-apps-row">
                          <span className="app-tag">Google Pay</span>
                          <span className="app-tag">PhonePe</span>
                          <span className="app-tag">Paytm</span>
                          <span className="app-tag">BHIM</span>
                        </div>
                        <p className="upi-instruction">
                          Pay exact amount <strong>₹{totalPrice}</strong> via any UPI application and upload screenshot below for instant verification.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="card-payment-view">
                    <div className="card-fields-grid">
                      <div className="form-group full-width">
                        <label className="form-label">Card Number</label>
                        <input type="text" className="form-input" placeholder="4242 •••• •••• 4242" defaultValue="4242 8192 3847 9120" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input type="text" className="form-input" placeholder="MM/YY" defaultValue="12/28" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input type="password" maxLength={4} className="form-input" placeholder="•••" defaultValue="821" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="netbanking-view">
                    <label className="form-label">Select Your Bank</label>
                    <select className="form-input" defaultValue="hdfc">
                      <option value="hdfc">HDFC Bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Requirement 24: Payment Screenshot UI */}
              <div className="screenshot-upload-section">
                <label className="form-label upload-label">
                  <Upload size={16} />
                  <span>Upload Payment Screenshot (Optional for Faster Verification)</span>
                </label>
                
                {screenshotPreview ? (
                  <div className="screenshot-preview-box">
                    <img src={screenshotPreview} alt="Screenshot preview" className="screenshot-img" />
                    <button
                      type="button"
                      className="btn-remove-screenshot"
                      onClick={() => setScreenshotPreview(null)}
                    >
                      <X size={16} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="upload-dropzone">
                    <input
                      type="file"
                      id="screenshotInput"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleScreenshotChange}
                      className="file-hidden-input"
                    />
                    <label htmlFor="screenshotInput" className="dropzone-label">
                      <Upload size={28} className="dropzone-icon" />
                      <strong>Click to upload payment screenshot</strong>
                      <span>Supports PNG, JPG, JPEG</span>
                    </label>
                  </div>
                )}
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
                    <span>Place Order & Pay ₹{totalPrice}</span>
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
